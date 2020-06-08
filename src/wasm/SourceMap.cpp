#include <iostream>
#include <sstream>

#include "SourceMap.h"
#include "sourcemap-schema_generated.h"


SourceMap::SourceMap() {}
SourceMap::~SourceMap() {}

void SourceMap::addRawMappings(std::string rawMappings, std::vector<std::string> sources, std::vector<std::string> sourcesContent, std::vector<std::string> names, int lineOffset, int columnOffset) {
    std::vector<int> namesIndex = addNames(names);
    std::vector<int> sourcesIndex = addSources(sources);
    for (int i=0; i < sourcesContent.size(); ++i) {
        _mapping_container.setSourceContent(sourcesIndex[i], sourcesContent[i]);
    }

    _mapping_container.addVLQMappings(rawMappings, sourcesIndex, namesIndex, lineOffset, columnOffset);
}

void SourceMap::addBufferMappings(std::string mapBuffer, int lineOffset, int columnOffset) {
    _mapping_container.addBufferMappings(mapBuffer.c_str(), lineOffset, columnOffset);
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
    return emscripten::val(emscripten::memory_view<uint8_t>(builder.GetSize(), builder.GetBufferPointer()));
}

std::vector<Mapping> SourceMap::getMappings(){
    auto &mappingLinesVector = _mapping_container.getMappingLinesVector();

    std::vector<Mapping> mappings;
    auto lineEnd = mappingLinesVector.end();
    for (auto lineIterator = mappingLinesVector.begin(); lineIterator != lineEnd; ++lineIterator) {
        const auto &line = (*lineIterator);
        auto &segments = line._segments;
        auto segmentsEnd = segments.end();

        for (auto segmentIterator = segments.begin(); segmentIterator != segmentsEnd; ++segmentIterator) {
            const Mapping &mapping = *segmentIterator;
            mappings.push_back(mapping);
        }
    }

    return mappings;
}

// addIndexedMapping(generatedLine, generatedColumn, originalLine, originalColumn, source, name)
void SourceMap::addIndexedMapping(int generatedLine, int generatedColumn, int originalLine, int originalColumn, std::string source, std::string name) {
    _mapping_container.addIndexedMapping(generatedLine, generatedColumn, originalLine, originalColumn, source, name);
}

int SourceMap::getSourceIndex(std::string source) {
    return _mapping_container.getSourceIndex(source);
}

std::string SourceMap::getSource(int index) {
    return _mapping_container.getSource(index);
}

int SourceMap::getNameIndex(std::string name) {
    return _mapping_container.getNameIndex(name);
}

std::string SourceMap::getName(int index) {
    return _mapping_container.getName(index);
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

int SourceMap::addSource(std::string source) {
    return _mapping_container.addSource(source);
}

int SourceMap::addName(std::string name) {
    return _mapping_container.addName(name);
}

std::string SourceMap::getSourceContent(std::string sourceName) {
    return _mapping_container.getSourceContent(_mapping_container.getSourceIndex(sourceName));
}

std::vector<std::string> SourceMap::getSourcesContent() {
    return _mapping_container.getSourcesContentVector();
}

void SourceMap::setSourceContent(std::string sourceName, std::string sourceContent) {
    _mapping_container.setSourceContent(_mapping_container.addSource(sourceName), sourceContent);
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
        .function("addIndexedMapping", &SourceMap::addIndexedMapping)
        .function("getVLQMappings", &SourceMap::getVLQMappings)
        .function("getMappings", &SourceMap::getMappings)
        .function("getSources", &SourceMap::getSources)
        .function("getSourcesContent", &SourceMap::getSourcesContent)
        .function("getNames", &SourceMap::getNames)
        .function("toBuffer", &SourceMap::toBuffer)
        .function("addName", &SourceMap::addName)
        .function("addSource", &SourceMap::addSource)
        .function("getSourceIndex", &SourceMap::getSourceIndex)
        .function("getSource", &SourceMap::getSource)
        .function("getSourceContent", &SourceMap::getSourceContent)
        .function("setSourceContent", &SourceMap::setSourceContent)
        .function("getNameIndex", &SourceMap::getNameIndex)
        .function("getName", &SourceMap::getName)
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
