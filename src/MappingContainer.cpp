#include <sstream>
#include <iostream>
#include "MappingContainer.h"
#include "vlq.h"

MappingContainer::MappingContainer() {}

MappingContainer::~MappingContainer() {}

void MappingContainer::Finalize() {}

int MappingContainer::getNamesCount() {
    return this->_names.size();
}

int MappingContainer::addName(std::string name) {
    this->_names.push_back(name);
    return (int) this->_names.size() - 1;
}

int MappingContainer::getSourcesCount() {
    return this->_sources.size();
}

int MappingContainer::addSource(std::string source) {
    this->_sources.push_back(source);
    return (int) this->_sources.size() - 1;
}

int MappingContainer::getGeneratedLines() {
    return _generated_lines;
}

int MappingContainer::getGeneratedColumns() {
    return _generated_columns;
}

// TODO: Use a background thread for sorting?
void MappingContainer::sort() {
    auto lineEnd = _mapping_lines.end();
    for (auto lineIterator = _mapping_lines.begin(); lineIterator != lineEnd; ++lineIterator) {
        (*lineIterator)->sort();
    }
}

void MappingContainer::addMapping(Position generated, Position original, int source, int name) {
    if (generated.column > _generated_columns) {
        _generated_columns = generated.column;
    }

    Mapping m = {
            .generated = generated,
            .original = original,
            .source = source,
            .name = name
    };

    this->_mapping_lines[generated.line]->addMapping(m);
    ++this->_segment_count;
}

int MappingContainer::segments() {
    return this->_segment_count;
}

void MappingContainer::_addMappingBySegment(int generatedLine, int *segment, int segmentIndex) {
    bool hasSource = segmentIndex > 3;
    bool hasName = segmentIndex > 4;

    Position generated = {
            .line = generatedLine,
            .column = segment[0]
    };

    Position original = {
            .line = hasSource ? segment[2] : -1,
            .column = hasSource ? segment[3] : -1
    };

    this->createLinesIfUndefined(generatedLine);
    this->addMapping(generated, original, hasSource ? segment[1] : -1, hasName ? segment[4] : -1);
}

void MappingContainer::createLinesIfUndefined(int generatedLine) {
    if (this->_generated_lines < generatedLine) {
        this->_mapping_lines.reserve(generatedLine - this->_generated_lines + 1);
    }

    // While our last line is not equal (or larger) to our generatedLine we need to add lines
    while (this->_generated_lines < generatedLine) {
        this->addLine();
    }
}

void MappingContainer::addVLQMappings(const std::string &mappings_input, int line_offset, int column_offset,
                                      int sources_offset, int names_offset) {
    // SourceMap information
    int generatedLine = line_offset;

    this->createLinesIfUndefined(generatedLine);

    // VLQ Decoding
    int value = 0;
    int shift = 0;
    int segment[5] = {column_offset, sources_offset, 0, 0, names_offset};
    int segmentIndex = 0;

    // TODO: Pre-allocating memory might speed up things...
    // `input.len() / 2` is the upper bound on how many mappings the string
    // might contain. There would be some sequence like `A,A,...` or `A;A...`
    // int upperbound = mappings_input.length() / 2;

    auto end = mappings_input.end();
    for (auto it = mappings_input.begin(); it != end; ++it) {
        const char c = *it;
        if (c == ',' || c == ';') {
            this->_addMappingBySegment(generatedLine, segment, segmentIndex);

            if (c == ';') {
                segment[0] = 0;
                ++generatedLine;
            }

            segmentIndex = 0;
            continue;
        }

        const int decodedCharacter = decodeBase64Char(c);

        value += (decodedCharacter & VLQ_BASE_MASK) << shift;

        if ((decodedCharacter & VLQ_BASE) != 0) {
            shift += VLQ_BASE_SHIFT;
        } else {
            // The low bit holds the sign.
            if ((value & 1) != 0) {
                value = -value;
            }

            segment[segmentIndex++] += value / 2;
            shift = value = 0;
        }
    }

    // Process last mapping...
    if (segmentIndex > 0) {
        this->_addMappingBySegment(generatedLine, segment, segmentIndex);
    }
}

std::string MappingContainer::toVLQMappings() {
    std::stringstream out;

    int previousSource = 0;
    int previousOriginalLine = 0;
    int previousOriginalColumn = 0;
    int previousName = 0;
    bool isFirstLine = true;

    // Sort mappings
    this->sort();

    auto lineEnd = _mapping_lines.end();
    for (auto lineIterator = _mapping_lines.begin(); lineIterator != lineEnd; ++lineIterator) {
        auto line = (*lineIterator);
        int previousGeneratedColumn = 0;

        if (!isFirstLine) {
            out << ";";
        }

        bool isFirstSegment = true;
        auto segments = line->_segments;
        auto segmentsEnd = segments.end();
        for (auto segmentIterator = segments.begin(); segmentIterator != segmentsEnd; ++segmentIterator) {
            Mapping mapping = *segmentIterator;

            if (!isFirstSegment) {
                out << ",";
            }

            encodeVlq(mapping.generated.column - previousGeneratedColumn, out);
            previousGeneratedColumn = mapping.generated.column;

            if (mapping.source > -1) {
                encodeVlq(mapping.source - previousSource, out);
                previousSource = mapping.source;

                encodeVlq(mapping.original.line - previousOriginalLine, out);
                previousOriginalLine = mapping.original.line;

                encodeVlq(mapping.original.column - previousOriginalColumn, out);
                previousOriginalColumn = mapping.original.column;
            }

            if (mapping.name > -1) {
                encodeVlq(mapping.name - previousName, out);
                previousName = mapping.name;
            }

            isFirstSegment = false;
        }

        isFirstLine = false;
    }

    return out.str();
}

int MappingContainer::getTotalSegments() {
    return this->_segment_count;
}

std::string MappingContainer::debugString() {
    std::stringstream out;

    auto end = this->_mapping_lines.end();
    for (auto lineIterator = this->_mapping_lines.begin(); lineIterator != end; ++lineIterator) {
        auto line = (*lineIterator);
        out << "==== Start Line ====" << std::endl;
        out << "Generated Line: " << line->lineNumber() << std::endl;

        auto segments = line->_segments;
        auto lineEnd = segments.end();
        for (auto it = segments.begin(); it != lineEnd; ++it) {
            Mapping mapping = *it;
            out << "==== Start Mapping ====" << std::endl;
            out << "Generated column: " << mapping.generated.column << std::endl;
            out << "Source: " << mapping.source << std::endl;
            out << "Original line: " << mapping.original.line << std::endl;
            out << "Original column: " << mapping.original.column << std::endl;
            out << "Name: " << mapping.name << std::endl;
        }
    }
    return out.str();
}

std::vector<std::string> &MappingContainer::getNamesVector() {
    return this->_names;
}

std::vector<std::string> &MappingContainer::getSourcesVector() {
    return this->_sources;
}

std::vector<MappingLine *> &MappingContainer::getMappingLinesVector() {
    return this->_mapping_lines;
}

MappingLine *MappingContainer::addLine(int size) {
    MappingLine *line = new MappingLine(++this->_generated_lines, size);
    this->_mapping_lines.push_back(line);
    return line;
}
