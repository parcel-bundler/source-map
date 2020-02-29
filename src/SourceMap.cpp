#include <iostream>
#include "SourceMap.h"
#include "Base64.h"

SourceMap::SourceMap() {}

void SourceMap::addMapping(int generatedLine, int *segment, int segmentIndex) {
    bool hasSource = segmentIndex > 3;
    bool hasName = segmentIndex > 4;

    Mapping m = {
            .generatedLine = generatedLine,
            .generatedColumn = segment[0],
            .originalLine = hasSource ? segment[1] : -1,
            .originalColumn = hasSource ? segment[2] : -1,
            .source = hasSource ? segment[3] : -1,
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

void SourceMap::fromString(const std::string &mappings_input) {
    // SourceMap information
    int generatedLine = 0;
    Base64Decoder decoder = Base64Decoder();

    // VLQ Decoding
    int value = 0;
    int shift = 0;
    int segment[5] = {};
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

        const int decodedCharacter = decoder.decode(c);

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
}
