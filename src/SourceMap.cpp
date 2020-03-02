#include <iostream>
#include <sstream>
#include "SourceMap.h"
#include "vlq.h"

SourceMap::SourceMap() {}

SourceMap::~SourceMap() {}

void SourceMap::Finalize() {}

void SourceMap::addMapping(int generatedLine, int *segment, int segmentIndex) {
    bool hasSource = segmentIndex > 3;
    bool hasName = segmentIndex > 4;

    Mapping m = {
            .generatedLine = generatedLine,
            .generatedColumn = segment[0],
            .originalLine = hasSource ? segment[2] : -1,
            .originalColumn = hasSource ? segment[3] : -1,
            .source = hasSource ? segment[1] : -1,
            .name = hasName ? segment[4] : -1
    };

    /*std::cout << "generatedLine: " << generatedLine << std::endl;
    std::cout << "generatedColumn: " << segment[0] << std::endl;
    std::cout << "originalLine: " << (hasSource ? segment[1] : -1) << std::endl;
    std::cout << "originalColumn: " << (hasSource ? segment[2] : -1) << std::endl;
    std::cout << "source: " << (hasSource ? segment[3] : -1) << std::endl;
    std::cout << "name: " << (hasName ? segment[4] : -1) << std::endl;*/

    _mappings.push_back(m);
}

void SourceMap::processRawMappings(const std::string &mappings_input, int sources, int names, int line_offset,
                                   int column_offset) {
    // SourceMap information
    int generatedLine = line_offset;

    // VLQ Decoding
    int value = 0;
    int shift = 0;
    int segment[5] = {column_offset, _sources, 0, 0, _names};
    int segmentIndex = 0;

    // `input.len() / 2` is the upper bound on how many mappings the string
    // might contain. There would be some sequence like `A,A,...` or `A;A...`
    _mappings.reserve(mappings_input.length() / 2);

    std::string::const_iterator it = mappings_input.begin();
    std::string::const_iterator end = mappings_input.end();
    for (; it != end; ++it) {
        const char c = *it;
        if (c == ',' || c == ';') {
            this->addMapping(generatedLine, segment, segmentIndex);

            if (c == ';') {
                segment[0] = 0;
                generatedLine++;
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
        this->addMapping(generatedLine, segment, segmentIndex);
    }

    _sources += sources;
    _names += names;
}

void SourceMap::addRawMappings(const std::string &mappings_input, int sources, int names, int line_offset,
                               int column_offset) {
    // Append new mappings
    processRawMappings(mappings_input, sources, names, line_offset, column_offset);
}

void SourceMap::addBufferMappings(uint8_t *bufferPointer, int line_offset, int column_offset) {
    auto map = SourceMapSchema::GetMap(bufferPointer);

    _mappings.reserve(map->mappings()->size());
    for (auto it = map->mappings()->begin(); it != map->mappings()->end(); it++) {
        Mapping m = {
                .generatedLine = it->generatedLine() + line_offset,
                .generatedColumn = it->generatedLine() + column_offset,
                .originalLine = it->originalLine(),
                .originalColumn = it->originalColumn(),
                .source = it->source() > -1 ? it->source() + _sources : -1,
                .name = it->name() > -1 ? it->name() + _names : -1
        };

        _mappings.push_back(m);
    }

    _sources += map->sources();
    _names += map->names();
}

std::pair<uint8_t *, size_t> SourceMap::toBuffer() {
    flatbuffers::FlatBufferBuilder builder;

    std::vector<SourceMapSchema::Mapping> mappings_vector;
    mappings_vector.reserve(_mappings.size());
    for (auto it = _mappings.begin(); it != _mappings.end(); it++) {
        Mapping mapping = *it;
        mappings_vector.push_back(
                SourceMapSchema::Mapping(mapping.generatedLine, mapping.generatedColumn, mapping.originalLine,
                                         mapping.originalColumn, mapping.source, mapping.name));
    }

    auto map = SourceMapSchema::CreateMapDirect(builder, _names, _sources, &mappings_vector);
    builder.Finish(map);

    std::pair<uint8_t *, char> res;
    res.first = builder.GetBufferPointer();
    res.second = builder.GetSize();

    return res;
}

std::string SourceMap::toString() {
    std::stringstream out;
    int previousGeneratedLine = 0;
    int previousGeneratedColumn = 0;
    int previousSource = 0;
    int previousOriginalLine = 0;
    int previousOriginalColumn = 0;
    int previousName = 0;
    bool isFirst = true;

    for (auto it = _mappings.begin(); it != _mappings.end(); it++) {
        Mapping mapping = *it;

        if (previousGeneratedLine < mapping.generatedLine) {
            previousGeneratedColumn = 0;
            isFirst = true;

            while (previousGeneratedLine < mapping.generatedLine) {
                out << ";";
                previousGeneratedLine++;
            }
        }

        if (!isFirst) {
            out << ",";
        }

        encodeVlq(mapping.generatedColumn - previousGeneratedColumn, out);
        previousGeneratedColumn = mapping.generatedColumn;

        if (mapping.source > -1) {
            encodeVlq(mapping.source - previousSource, out);
            previousSource = mapping.source;

            encodeVlq(mapping.originalLine - previousOriginalLine, out);
            previousOriginalLine = mapping.originalLine;

            encodeVlq(mapping.originalColumn - previousOriginalColumn, out);
            previousOriginalColumn = mapping.originalColumn;
        }

        if (mapping.name > -1) {
            encodeVlq(mapping.name - previousName, out);
            previousName = mapping.name;
        }

        isFirst = false;
    }

    return out.str();
}
