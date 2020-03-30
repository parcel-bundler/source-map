#include <iostream>
#include <sstream>

#include "SourceMap.h"
#include "sourcemap-schema_generated.h"


SourceMap::SourceMap() {}
SourceMap::~SourceMap() {}

void SourceMap::addRawMappings(std::string rawMappings, std::vector<std::string> sources, std::vector<std::string> names, int lineOffset, int columnOffset) {
    std::vector<int> namesIndex = addNames(names);
    std::vector<int> sourcesIndex = addSources(sources);

    _mapping_container.addVLQMappings(rawMappings, sourcesIndex, namesIndex, lineOffset, columnOffset);
}

void SourceMap::addBufferMappings(std::string mapBuffer, int lineOffset, int columnOffset) {
    auto map = SourceMapSchema::GetMap(mapBuffer.c_str());

    std::vector<int> sources;
    auto sourcesArray = map->sources();
    sources.reserve(sourcesArray->size());
    auto sourcesEnd = sourcesArray->end();
    for (auto it = sourcesArray->begin(); it != sourcesEnd; ++it) {
        std::string source = it->str();
        sources.push_back(_mapping_container.addSource(source));
    }

    std::vector<int> names;
    auto namesArray = map->names();
    names.reserve(namesArray->size());
    auto namesEnd = namesArray->end();
    for (auto it = namesArray->begin(); it != namesEnd; ++it) {
        std::string name = it->str();
        names.push_back(_mapping_container.addName(name));
    }

    _mapping_container.createLinesIfUndefined(map->lineCount() + lineOffset);

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
            _mapping_container.addMapping(generated, original, source, name);
        }
    }
}

void SourceMap::extends(std::string mapBuffer) {
    auto map = SourceMapSchema::GetMap(mapBuffer.c_str());

    std::vector<int> sources;
    auto sourcesArray = map->sources();
    sources.reserve(sourcesArray->size());
    auto sourcesEnd = sourcesArray->end();
    for (auto it = sourcesArray->begin(); it != sourcesEnd; ++it) {
        std::string source = it->str();
        sources.push_back(_mapping_container.addSource(source));
    }

    std::vector<int> names;
    auto namesArray = map->names();
    names.reserve(namesArray->size());
    auto namesEnd = namesArray->end();
    for (auto it = namesArray->begin(); it != namesEnd; ++it) {
        std::string name = it->str();
        names.push_back(_mapping_container.addName(name));
    }

    auto originalLines = map->lines();
    auto originalLineCount = map->lineCount();

    std::vector<flatbuffers::Offset<SourceMapSchema::MappingLine>> lines_vector;
    auto &mappingLinesVector = _mapping_container.getMappingLinesVector();
    lines_vector.reserve(mappingLinesVector.size());

    auto lineEnd = mappingLinesVector.end();
    for (auto lineIterator = mappingLinesVector.begin(); lineIterator != lineEnd; ++lineIterator) {
        auto &line = (*lineIterator);
        auto &segments = line->_segments;
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

std::string SourceMap::getVLQMappings(){
    return _mapping_container.toVLQMappings();
}

std::vector<std::string> SourceMap::getSources(){
    return _mapping_container.getSourcesVector();
}

std::vector<std::string> SourceMap::getNames(){
    return _mapping_container.getNamesVector();
}

emscripten::val SourceMap::toBuffer() {
    flatbuffers::FlatBufferBuilder builder;

    // Sort mappings
    _mapping_container.sort();

    std::vector<flatbuffers::Offset<flatbuffers::String>> names_vector;
    auto namesVector = _mapping_container.getNamesVector();
    names_vector.reserve(namesVector.size());
    auto namesEnd = namesVector.end();
    for (auto it = namesVector.begin(); it != namesEnd; ++it) {
        names_vector.push_back(builder.CreateString(*it));
    }

    std::vector<flatbuffers::Offset<flatbuffers::String>> sources_vector;
    auto sourcesVector = _mapping_container.getSourcesVector();
    sources_vector.reserve(sourcesVector.size());
    auto sourcesEnd = sourcesVector.end();
    for (auto it = sourcesVector.begin(); it != sourcesEnd; ++it) {
        sources_vector.push_back(builder.CreateString(*it));
    }

    std::vector<flatbuffers::Offset<SourceMapSchema::MappingLine>> lines_vector;
    auto mappingLinesVector = _mapping_container.getMappingLinesVector();
    lines_vector.reserve(mappingLinesVector.size());

    auto lineEnd = mappingLinesVector.end();
    for (auto lineIterator = mappingLinesVector.begin(); lineIterator != lineEnd; ++lineIterator) {
        auto &line = (*lineIterator);
        auto &segments = line->_segments;
        auto segmentsEnd = segments.end();

        std::vector<SourceMapSchema::Mapping> mappings_vector;
        mappings_vector.reserve(segments.size());
        for (auto segmentIterator = segments.begin(); segmentIterator != segmentsEnd; ++segmentIterator) {
            Mapping &mapping = *segmentIterator;

            mappings_vector.push_back(
                    SourceMapSchema::Mapping(mapping.generated.line, mapping.generated.column, mapping.original.line,
                                             mapping.original.column, mapping.source, mapping.name));
        }

        lines_vector.push_back(SourceMapSchema::CreateMappingLineDirect(builder, line->lineNumber(), line->isSorted(),
                                                                        &mappings_vector));
    }

    auto map = SourceMapSchema::CreateMapDirect(builder, &names_vector, &sources_vector,
                                                _mapping_container.getGeneratedLines(), &lines_vector);

    builder.Finish(map);

    return emscripten::val(emscripten::typed_memory_view(builder.GetSize(), builder.GetBufferPointer()));
}

// // returns the sorted and processed map with decoded vlqs and all other map data
std::vector<Mapping> SourceMap::getMappings(){
    auto &mappingLinesVector = _mapping_container.getMappingLinesVector();

    std::vector<Mapping> mappings;
    auto lineEnd = mappingLinesVector.end();
    for (auto lineIterator = mappingLinesVector.begin(); lineIterator != lineEnd; ++lineIterator) {
        auto &line = (*lineIterator);
        auto &segments = line->_segments;
        auto segmentsEnd = segments.end();

        for (auto segmentIterator = segments.begin(); segmentIterator != segmentsEnd; ++segmentIterator) {
            Mapping &mapping = *segmentIterator;
            mappings.push_back(mapping);
        }
    }

    return mappings;
}

// addIndexedMappings(array<mapping>, lineOffset, columnOffset): uses numbers for source and name with the index specified in the sources/names map/array in SourceMap instance
void SourceMap::addIndexedMappings(std::vector<IndexedMapping> mappingsArray, int lineOffset, int columnOffset) {
    for (auto mapping = mappingsArray.begin(), lineEnd = mappingsArray.end();
            mapping != lineEnd; ++mapping) {


        int generatedLine = mapping->generated.line - 1;
        int generatedColumn = mapping->generated.column;
        Position generatedPosition = Position{generatedLine + lineOffset, generatedColumn + columnOffset};

        int originalColumn = mapping->original.column;
        int originalLine = mapping->original.line - 1;
        if (originalColumn >= 0 && originalLine >= 0) {
            Position originalPosition = Position{originalLine, originalColumn};

            int source = _mapping_container.addSource(mapping->source);

            if (mapping->name.size() > 0) {
                _mapping_container.addMapping(generatedPosition, originalPosition, source, _mapping_container.addName(mapping->name));
            } else {
                _mapping_container.addMapping(generatedPosition, originalPosition, source);
            }
        } else {
            _mapping_container.addMapping(generatedPosition);
        }
    }
}

int SourceMap::getSourceIndex(std::string source) {
    return _mapping_container.getSourceIndex(source);
}

int SourceMap::getNameIndex(std::string name) {
    return _mapping_container.getNameIndex(name);
}

std::vector<int> SourceMap::addNames(std::vector<std::string> &names) {
    std::vector<int> insertions;
    insertions.reserve(names.size());
    for (std::string &name: names) {
        insertions.push_back(_mapping_container.addName(name));
    }
    return insertions;
}

std::vector<int> SourceMap::addSources(std::vector<std::string> &sources) {
    std::vector<int> insertions;
    insertions.reserve(sources.size());
    for (std::string &source: sources) {
        insertions.push_back(_mapping_container.addSource(source));
    }
    return insertions;
}

void SourceMap::addEmptyMap(std::string sourceName, std::string sourceContent, int lineOffset) {
    int sourceIndex = _mapping_container.addSource(sourceName);
    int currLine = 0;
    auto end = sourceContent.end();
    for (auto it = sourceContent.begin(); it != end; ++it) {
        const char &c = *it;
        if (c == '\n') {
            _mapping_container.addMapping(Position{currLine + lineOffset, 0}, Position{currLine, 0}, sourceIndex);
            ++currLine;
        }
    }
}

Mapping SourceMap::findClosestMapping(int line, int column) {
    int lineIndex = line - 1;
    int columnIndex = column;

    if (lineIndex <= _mapping_container.getGeneratedLines()) {
        auto &mappingLinesVector = _mapping_container.getMappingLinesVector();
        auto &line = mappingLinesVector.at(lineIndex);
        auto &segments = line->_segments;
        unsigned int segmentsCount = segments.size();

        std::vector<SourceMapSchema::Mapping> mappings_vector;
        mappings_vector.reserve(segments.size());
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
                // It's the same...
                break;
            }

            middleIndex = ((stopIndex + startIndex) / 2);
        }

        return segments[middleIndex];
    }

    return Mapping{Position{-1, -1}, Position{-1, -1}, -1, -1};
}

EMSCRIPTEN_BINDINGS(my_class_example) {
    emscripten::register_vector<std::string>("VectorString");
    emscripten::register_vector<Mapping>("VectorMapping");
    emscripten::register_vector<IndexedMapping>("VectorIndexedMapping");
    emscripten::register_vector<int>("VectorInt");

    emscripten::class_<SourceMap>("SourceMap")
        .constructor<>()
        .function("addRawMappings", &SourceMap::addRawMappings)
        .function("addBufferMappings", &SourceMap::addBufferMappings)
        .function("addIndexedMappings", &SourceMap::addIndexedMappings)
        .function("getVLQMappings", &SourceMap::getVLQMappings)
        .function("getMappings", &SourceMap::getMappings)
        .function("getSources", &SourceMap::getSources)
        .function("getNames", &SourceMap::getNames)
        .function("toBuffer", &SourceMap::toBuffer)
        .function("addNames", &SourceMap::addNames)
        .function("addSources", &SourceMap::addSources)
        .function("getSourceIndex", &SourceMap::getSourceIndex)
        .function("getNameIndex", &SourceMap::getNameIndex)
        .function("addEmptyMap", &SourceMap::addEmptyMap)
        .function("extends", &SourceMap::extends)
        .function("findClosestMapping", &SourceMap::findClosestMapping)
        ;

    emscripten::value_object<Mapping>("Mapping")
        .field("generated", &Mapping::generated)
        .field("original", &Mapping::original)
        .field("source", &Mapping::source)
        .field("name", &Mapping::name)
        ;    

    emscripten::value_object<IndexedMapping>("IndexedMapping")
        .field("generated", &IndexedMapping::generated)
        .field("original", &IndexedMapping::original)
        .field("source", &IndexedMapping::source)
        .field("name", &IndexedMapping::name)
        ;    

    emscripten::value_object<Position>("Position")
        .field("line", &Position::line)
        .field("column", &Position::column)
        ;
}
