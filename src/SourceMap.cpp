#include <iostream>
#include "SourceMap.h"
#include "Base64.h"

SourceMap::SourceMap() {}

SourceMap::~SourceMap() {}

void SourceMap::Finalize() {}

void SourceMap::readRawMappings() {
    if (_raw_mappings.length() > 0) {
        readMappings(_raw_mappings, _raw_sources, _raw_names);
    }
}

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

    _parsed_mappings.push_back(m);
}

void SourceMap::readMappings(const std::string &mappings_input, int sources, int names, int line_offset,
                             int column_offset) {
    // SourceMap information
    int generatedLine = line_offset;

    // VLQ Decoding
    int value = 0;
    int shift = 0;
    int segment[5] = {column_offset, _parsed_sources, 0, 0, _parsed_names};
    int segmentIndex = 0;

    // `input.len() / 2` is the upper bound on how many mappings the string
    // might contain. There would be some sequence like `A,A,...` or `A;A...`
    _parsed_mappings.reserve(mappings_input.length() / 2);

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

        const int decodedCharacter = decode_char(c);

        value += (decodedCharacter & 31) << shift;

        if ((decodedCharacter & 32) != 0) {
            shift += 5;
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

    _parsed_sources += sources;
    _parsed_names += names;
}

void SourceMap::addMappings(const std::string &mappings_input, int sources, int names, int line_offset,
                            int column_offset) {
    if (line_offset != 0 || column_offset != 0 || !_parsed_mappings.empty() || true) {
        // Process any raw mappings
        readRawMappings();

        // Append new mappings
        readMappings(mappings_input, sources, names, line_offset, column_offset);
    } else {
        _raw_mappings = mappings_input;
        _raw_sources = sources;
        _raw_names = names;
    }
}

std::string SourceMap::toString() {
    if (_parsed_mappings.empty()) {
        // std::cout << "return _raw_mappings " << *_raw_mappings << std::endl;

        return _raw_mappings;
    } else {
        // TODO: Compile mappings...
        return "";
    }
}
