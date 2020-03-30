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
    _mapping_container.addBufferMappings(mapBuffer.c_str());
}

void SourceMap::extends(std::string mapBuffer) {
    _mapping_container.extends(mapBuffer.c_str());
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
    auto builder = _mapping_container.toBuffer();
    return emscripten::val(emscripten::typed_memory_view(builder.GetSize(), builder.GetBufferPointer()));
}

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
    _mapping_container.addEmptyMap(sourceName, sourceContent, lineOffset);
}

Mapping SourceMap::findClosestMapping(int line, int column) {
    return _mapping_container.findClosestMapping(line - 1, column);
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
