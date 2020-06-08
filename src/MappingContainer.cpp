#include "MappingContainer.h"
#include "vlq.h"

MappingContainer::MappingContainer() {}
MappingContainer::~MappingContainer() {}

int MappingContainer::addName(std::string &name) {
    int index = getNameIndex(name);
    if (index < 0) {
        _names.push_back(name);
        index = (int) _names.size() - 1;
        _names_index[name] = index;
    }
    return index;
}

int MappingContainer::addSource(std::string &sourceName) {
    int index = getSourceIndex(sourceName);
    if (index < 0) {
        _sources.push_back(sourceName);
        index = (int) _sources.size() - 1;
        _sources_index[sourceName] = index;
    }
    return index;
}

void MappingContainer::setSourceContent(int sourceIndex, std::string &sourceContent) {
    if ((int) _sources_content.size() <= sourceIndex) {
        _sources_content.resize(sourceIndex + 1);
    }

    _sources_content[sourceIndex] = sourceContent;
}

int MappingContainer::getGeneratedLines() {
    return _generated_lines;
}

void MappingContainer::sort() {
    auto lineEnd = _mapping_lines.end();
    for (auto lineIterator = _mapping_lines.begin(); lineIterator != lineEnd; ++lineIterator) {
        lineIterator->sort();
    }
}

void MappingContainer::addMapping(Position generated, Position original, int source, int name) {
    createLinesIfUndefined(generated.line);
    _mapping_lines[generated.line].addMapping(Mapping{generated, original, source, name});
    ++_segment_count;
}

void MappingContainer::createLinesIfUndefined(int generatedLine) {
    if (_generated_lines < generatedLine) {
        _mapping_lines.reserve(generatedLine - _generated_lines + 1);

        // While our last line is not equal (or larger) to our generatedLine we need to add lines
        while (_generated_lines < generatedLine) {
            addLine();
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

            addMapping(generated, original, hasSource ? sources[segment[1]] : -1,
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

        addMapping(generated, original, hasSource ? sources[segment[1]] : -1, hasName ? names[segment[4]] : -1);
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
    sort();

    auto lineEnd = _mapping_lines.end();
    for (auto lineIterator = _mapping_lines.begin(); lineIterator != lineEnd; ++lineIterator) {
        auto &line = (*lineIterator);
        int previousGeneratedColumn = 0;

        if (!isFirstLine) {
            out << ";";
        }

        bool isFirstSegment = true;
        auto &segments = line._segments;
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

Mapping MappingContainer::findClosestMapping(int lineIndex, int columnIndex) {
    if (lineIndex <= _generated_lines) {
        auto &line = _mapping_lines.at(lineIndex);
        auto &segments = line._segments;
        unsigned int segmentsCount = segments.size();

        int startIndex = 0;
        int stopIndex = segmentsCount - 1;
        int middleIndex = ((stopIndex + startIndex) / 2);
        while (startIndex < stopIndex) {
            Mapping &mapping = segments[middleIndex];
            int diff = mapping.generated.column - columnIndex;
            if (diff > 0) {
                --stopIndex;
            } else if (diff < 0) {
                ++startIndex;
            } else {
                break;
            }

            middleIndex = ((stopIndex + startIndex) / 2);
        }

        return segments[middleIndex];
    }

    return Mapping{Position{-1, -1}, Position{-1, -1}, -1, -1};
}

int MappingContainer::getTotalSegments() {
    return _segment_count;
}

std::vector<std::string> &MappingContainer::getNamesVector() {
    return _names;
}

std::vector<std::string> &MappingContainer::getSourcesVector() {
    return _sources;
}

std::vector<std::string> &MappingContainer::getSourcesContentVector() {
    return _sources_content;
}

std::vector<MappingLine> &MappingContainer::getMappingLinesVector() {
    return _mapping_lines;
}

void MappingContainer::addLine() {
    _mapping_lines.push_back(MappingLine(++_generated_lines));
}

int MappingContainer::getSourceIndex(std::string &source) {
    auto foundValue = _sources_index.find(source);
    if (foundValue == _sources_index.end()) {
        return -1;
    }
    return foundValue->second;
}

std::string MappingContainer::getSource(int sourceIndex) {
    if (sourceIndex < 0 || sourceIndex >= ((int) _sources.size())) {
        return "";
    }

    return _sources[sourceIndex];
}

int MappingContainer::getNameIndex(std::string &name) {
    auto foundValue = _names_index.find(name);
    if (foundValue == _names_index.end()) {
        return -1;
    }
    return foundValue->second;
}

std::string MappingContainer::getName(int nameIndex) {
    if (nameIndex < 0 || nameIndex >= ((int) _names.size())) {
        return "";
    }

    return _names[nameIndex];
}

std::string MappingContainer::getSourceContent(int sourceIndex) {
    return _sources_content[sourceIndex];
}

void MappingContainer::addEmptyMap(std::string& sourceName, std::string& sourceContent, int lineOffset) {
    int sourceIndex = addSource(sourceName);
    int currLine = 0;
    auto end = sourceContent.end();
    for (auto it = sourceContent.begin(); it != end; ++it) {
        const char &c = *it;
        if (c == '\n') {
            addMapping(Position{currLine + lineOffset, 0}, Position{currLine, 0}, sourceIndex);
            ++currLine;
        }
    }
}

flatbuffers::FlatBufferBuilder MappingContainer::toBuffer() {
    flatbuffers::FlatBufferBuilder builder;

    // Sort mappings
    sort();

    std::vector<flatbuffers::Offset<flatbuffers::String>> names_vector;
    names_vector.reserve(_names.size());
    for (auto it = _names.begin(); it != _names.end(); ++it) {
        names_vector.push_back(builder.CreateString(*it));
    }

    std::vector<flatbuffers::Offset<flatbuffers::String>> sources_vector;
    sources_vector.reserve(_sources.size());
    for (auto it = _sources.begin(); it != _sources.end(); ++it) {
        sources_vector.push_back(builder.CreateString(*it));
    }

    std::vector<flatbuffers::Offset<flatbuffers::String>> sources_content_vector;
    sources_content_vector.reserve(_sources_content.size());
    for (auto it = _sources_content.begin(); it != _sources_content.end(); ++it) {
        sources_content_vector.push_back(builder.CreateString(*it));
    }

    std::vector<flatbuffers::Offset<SourceMapSchema::MappingLine>> lines_vector;
    auto mappingLinesVector = getMappingLinesVector();
    lines_vector.reserve(mappingLinesVector.size());

    auto lineEnd = mappingLinesVector.end();
    for (auto lineIterator = mappingLinesVector.begin(); lineIterator != lineEnd; ++lineIterator) {
        auto &line = (*lineIterator);
        auto &segments = line._segments;
        auto segmentsEnd = segments.end();

        std::vector<SourceMapSchema::Mapping> mappings_vector;
        mappings_vector.reserve(segments.size());
        for (auto segmentIterator = segments.begin(); segmentIterator != segmentsEnd; ++segmentIterator) {
            Mapping &mapping = *segmentIterator;

            mappings_vector.push_back(
                    SourceMapSchema::Mapping(mapping.generated.line, mapping.generated.column, mapping.original.line,
                                             mapping.original.column, mapping.source, mapping.name));
        }

        lines_vector.push_back(SourceMapSchema::CreateMappingLineDirect(builder, line.lineNumber(), line.isSorted(),
                                                                        &mappings_vector));
    }

    auto map = SourceMapSchema::CreateMapDirect(builder, &names_vector, &sources_vector, &sources_content_vector,
                                                getGeneratedLines(), &lines_vector);

    builder.Finish(map);

    return builder;
}

void MappingContainer::extends(const void *buf) {
    auto map = SourceMapSchema::GetMap(buf);

    std::vector<int> sources;
    auto sourcesArray = map->sources();
    sources.reserve(sourcesArray->size());
    auto sourcesEnd = sourcesArray->end();
    for (auto it = sourcesArray->begin(); it != sourcesEnd; ++it) {
        std::string source = it->str();
        sources.push_back(addSource(source));
    }

    int sourcesContentIndex = 0;
    auto sourcesContentArray = map->sourcesContent();
    for (auto it = sourcesContentArray->begin(); it != sourcesContentArray->end(); ++it) {
        std::string sourceContent = it->str();
        if (sourceContent.length() > 0) {
            setSourceContent(sources[sourcesContentIndex], sourceContent);
        }
        ++sourcesContentIndex;
    }

    std::vector<int> names;
    auto namesArray = map->names();
    names.reserve(namesArray->size());
    auto namesEnd = namesArray->end();
    for (auto it = namesArray->begin(); it != namesEnd; ++it) {
        std::string name = it->str();
        names.push_back(addName(name));
    }

    auto originalLines = map->lines();
    auto originalLineCount = map->lineCount();

    std::vector<flatbuffers::Offset<SourceMapSchema::MappingLine>> lines_vector;
    auto &mappingLinesVector = getMappingLinesVector();
    lines_vector.reserve(mappingLinesVector.size());

    auto lineEnd = mappingLinesVector.end();
    for (auto lineIterator = mappingLinesVector.begin(); lineIterator != lineEnd; ++lineIterator) {
        auto &line = (*lineIterator);
        auto &segments = line._segments;
        unsigned int segmentsCount = segments.size();

        std::vector<SourceMapSchema::Mapping> mappings_vector;
        mappings_vector.reserve(segments.size());
        for (unsigned int i = 0; i < segmentsCount; ++i) {
            Mapping &mapping = segments[i];

            if (mapping.source > -1) {
                int originalLineIndex = mapping.original.line;
                if (originalLineCount >= originalLineIndex) {
                    int originalColumnIndex = mapping.original.column;
                    auto originalLine = originalLines->Get(originalLineIndex);
                    auto originalSegments = originalLine->segments();
                    int originalSegmentsSize = originalSegments->size();
                    if (originalSegmentsSize > 0) {
                        int startIndex = 0;
                        int stopIndex = originalSegmentsSize - 1;
                        int middleIndex = ((stopIndex + startIndex) / 2);
                        while (startIndex < stopIndex) {
                            int diff = originalSegments->Get(middleIndex)->generatedColumn() - originalColumnIndex;
                            if (diff > 0) {
                                --stopIndex;
                            } else if (diff < 0) {
                                ++startIndex;
                            } else {
                                // It's the same...
                                break;
                            }

                            middleIndex = ((stopIndex + startIndex) / 2);
                        }

                        auto originalMapping = originalSegments->Get(middleIndex);
                        int originalSource = originalMapping->source();
                        mapping.source = originalSource > -1 ? sources[originalSource] : originalSource;
                        mapping.original = Position(originalMapping->originalLine(),
                                                    originalMapping->originalColumn());

                        int originalName = originalMapping->name();
                        if (originalName > -1) {
                            mapping.name = names[originalName];
                        } else {
                            mapping.name = -1;
                        }
                    }
                }
            }
        }
    }
}

void MappingContainer::addBufferMappings(const void *buf, int lineOffset, int columnOffset) {
    auto map = SourceMapSchema::GetMap(buf);

    std::vector<int> sources;
    auto sourcesArray = map->sources();
    sources.reserve(sourcesArray->size());
    for (auto it = sourcesArray->begin(); it != sourcesArray->end(); ++it) {
        std::string source = it->str();
        sources.push_back(addSource(source));
    }

    int sourcesContentIndex = 0;
    auto sourcesContentArray = map->sourcesContent();
    for (auto it = sourcesContentArray->begin(); it != sourcesContentArray->end(); ++it) {
        std::string sourceContent = it->str();
        setSourceContent(sources[sourcesContentIndex], sourceContent);
        ++sourcesContentIndex;
    }

    std::vector<int> names;
    auto namesArray = map->names();
    names.reserve(namesArray->size());
    for (auto it = namesArray->begin(); it != namesArray->end(); ++it) {
        std::string name = it->str();
        names.push_back(addName(name));
    }

    createLinesIfUndefined(map->lineCount() + lineOffset);

    auto lines = map->lines();
    auto linesEnd = lines->end();
    for (auto linesIterator = map->lines()->begin(); linesIterator != linesEnd; ++linesIterator) {
        auto line = (*linesIterator);
        auto segments = line->segments();
        auto segmentsEnd = segments->end();

        for (auto segmentIterator = segments->begin(); segmentIterator != segmentsEnd; ++segmentIterator) {
            Position generated = Position{segmentIterator->generatedLine() + lineOffset,
                                          segmentIterator->generatedColumn() + columnOffset};
            Position original = Position{segmentIterator->originalLine(), segmentIterator->originalColumn()};

            int source = segmentIterator->source() > -1 ? sources[segmentIterator->source()] : -1;
            int name = segmentIterator->name() > -1 ? names[segmentIterator->name()] : -1;
            addMapping(generated, original, source, name);
        }
    }
}

void MappingContainer::addIndexedMapping(int generatedLine, int generatedColumn, int originalLine, int originalColumn,
                                         std::string source, std::string name) {
    Position generatedPosition = Position{generatedLine, generatedColumn};
    Position originalPosition = Position{originalLine, originalColumn};
    int sourceIndex = -1;
    int nameIndex = -1;
    if (originalPosition.line > -1) {
        if (!source.empty()) {
            sourceIndex = addSource(source);
        }

        if (!name.empty()) {
            nameIndex = addName(name);
        }
    }

    addMapping(generatedPosition, originalPosition, sourceIndex, nameIndex);
}
