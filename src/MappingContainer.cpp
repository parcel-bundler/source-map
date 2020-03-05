#include <sstream>
#include "MappingContainer.h"
#include "vlq.h"

MappingContainer::MappingContainer() {}

MappingContainer::~MappingContainer() {}

void MappingContainer::Finalize() {}

int MappingContainer::getNamesCount() {
    return this->_names.size();
}

int MappingContainer::addName(std::string name) {
    int index = this->getNameIndex(name);
    if (index < 0) {
        this->_names.push_back(name);
        index = (int) this->_names.size() - 1;
        this->_names_index[name] = index;
    }
    return index;
}

int MappingContainer::getSourcesCount() {
    return this->_sources.size();
}

int MappingContainer::addSource(std::string source) {
    int index = this->getSourceIndex(source);
    if (index < 0) {
        this->_sources.push_back(source);
        index = (int) this->_sources.size() - 1;
        this->_sources_index[source] = index;
    }
    return index;
}

int MappingContainer::getGeneratedLines() {
    return _generated_lines;
}

int MappingContainer::getGeneratedColumns() {
    return _generated_columns;
}

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

    this->createLinesIfUndefined(generated.line);
    this->_mapping_lines[generated.line]->addMapping(Mapping{generated, original, source, name});
    ++this->_segment_count;
}

int MappingContainer::getSegmentsCount() {
    return this->_segment_count;
}

void MappingContainer::createLinesIfUndefined(int generatedLine) {
    if (this->_generated_lines < generatedLine) {
        this->_mapping_lines.reserve(generatedLine - this->_generated_lines + 1);

        // While our last line is not equal (or larger) to our generatedLine we need to add lines
        while (this->_generated_lines < generatedLine) {
            this->addLine();
        }
    }
}

void MappingContainer::addVLQMappings(const std::string &mappings_input, std::vector<int> &sources,
                                      std::vector<int> &names, int line_offset, int column_offset) {
    // SourceMap information
    int generatedLine = line_offset;

    // VLQ Decoding
    int value = 0;
    int shift = 0;
    int segment[5] = {column_offset, 0, 0, 0, 0};
    int segmentIndex = 0;

    // `input.len() / 2` is the upper bound on how many mappings the string
    // might contain. There would be some sequence like `A,A,...` or `A;A...`
    // int upperbound = mappings_input.length() / 2;

    auto end = mappings_input.end();
    for (auto it = mappings_input.begin(); it != end; ++it) {
        const char &c = *it;
        if (c == ',' || c == ';') {
            bool hasSource = segmentIndex > 3;
            bool hasName = segmentIndex > 4;

            Position generated = Position{generatedLine, segment[0]};
            Position original = Position{hasSource ? segment[2] : -1, hasSource ? segment[3] : -1};

            this->addMapping(generated, original, hasSource ? sources[segment[1]] : -1,
                             hasName ? names[segment[4]] : -1);

            if (c == ';') {
                segment[0] = column_offset;
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
        bool hasSource = segmentIndex > 3;
        bool hasName = segmentIndex > 4;

        Position generated = Position{generatedLine, segment[0]};
        Position original = Position{hasSource ? segment[2] : -1, hasSource ? segment[3] : -1};

        this->addMapping(generated, original, hasSource ? sources[segment[1]] : -1, hasName ? names[segment[4]] : -1);
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
        auto &line = (*lineIterator);
        int previousGeneratedColumn = 0;

        if (!isFirstLine) {
            out << ";";
        }

        bool isFirstSegment = true;
        auto &segments = line->_segments;
        auto segmentsEnd = segments.end();
        for (auto segmentIterator = segments.begin(); segmentIterator != segmentsEnd; ++segmentIterator) {
            Mapping &mapping = *segmentIterator;

            if (!isFirstSegment) {
                out << ",";
            }

            encodeVlq(mapping.generated.column - previousGeneratedColumn, out);
            previousGeneratedColumn = mapping.generated.column;

            int mappingSource = mapping.source;
            if (mappingSource > -1) {
                encodeVlq(mappingSource - previousSource, out);
                previousSource = mappingSource;

                encodeVlq(mapping.original.line - previousOriginalLine, out);
                previousOriginalLine = mapping.original.line;

                encodeVlq(mapping.original.column - previousOriginalColumn, out);
                previousOriginalColumn = mapping.original.column;
            }

            int mappingName = mapping.name;
            if (mappingName > -1) {
                encodeVlq(mappingName - previousName, out);
                previousName = mappingName;
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

int MappingContainer::getSourceIndex(std::string source) {
    auto foundValue = _sources_index.find(source);
    if (foundValue == _sources_index.end()) {
        return -1;
    }
    return foundValue->second;
}

int MappingContainer::getNameIndex(std::string name) {
    auto foundValue = _names_index.find(name);
    if (foundValue == _names_index.end()) {
        return -1;
    }
    return foundValue->second;
}
