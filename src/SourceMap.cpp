#include <iostream>
#include <sstream>
#include "SourceMap.h"
#include "sourcemap-schema_generated.h"

SourceMapBinding::SourceMapBinding(const Napi::CallbackInfo &info) : Napi::ObjectWrap<SourceMapBinding>(info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() > 0) {
        if (info[0].IsString()) {
            this->addRawMappings(info);
        } else if (info[0].IsBuffer()) {
            this->addBufferMappings(info);
        } else if (info[0].IsArray()) {
            this->addIndexedMappings(info);
        }
    }
}

SourceMapBinding::~SourceMapBinding() {}

void SourceMapBinding::addRawMappings(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 3) {
        Napi::TypeError::New(env, "Expected 3-5 parameters").ThrowAsJavaScriptException();
    }

    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "First parameter should be a positive string").ThrowAsJavaScriptException();
    }

    if (!info[1].IsArray() || !info[2].IsArray()) {
        Napi::TypeError::New(env,
                             "Second and third parameter should be an array of strings").ThrowAsJavaScriptException();
    }

    if (info.Length() > 3 && !info[3].IsNumber()) {
        Napi::TypeError::New(env, "Fourth parameter should be a positive number").ThrowAsJavaScriptException();
    }

    if (info.Length() > 4 && !info[4].IsNumber()) {
        Napi::TypeError::New(env, "Fifth parameter should be a positive number").ThrowAsJavaScriptException();
    }

    std::string rawMappings = info[0].As<Napi::String>().Utf8Value();
    Napi::Array sources = info[1].As<Napi::Array>();
    Napi::Array names = info[2].As<Napi::Array>();
    int lineOffset = info.Length() > 3 ? info[3].As<Napi::Number>().Int32Value() : 0;
    int columnOffset = info.Length() > 4 ? info[4].As<Napi::Number>().Int32Value() : 0;

    std::vector<int> namesIndex = this->_addNames(names);
    std::vector<int> sourcesIndex = this->_addSources(sources);

    this->_mapping_container.addVLQMappings(rawMappings, sourcesIndex, namesIndex, lineOffset, columnOffset);
}

void SourceMapBinding::addBufferMappings(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected 1-3 parameters").ThrowAsJavaScriptException();
    }

    if (!info[0].IsBuffer()) {
        Napi::TypeError::New(env, "Expected a string for the first parameter").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 1 && !info[1].IsNumber()) {
        Napi::TypeError::New(env, "Expected a number for the second parameter").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 2 && !info[2].IsNumber()) {
        Napi::TypeError::New(env, "Expected a number for the third parameter").ThrowAsJavaScriptException();
        return;
    }

    auto mapBuffer = info[0].As<Napi::Buffer<uint8_t>>();
    int lineOffset = info.Length() > 1 ? info[1].As<Napi::Number>().Int32Value() : 0;
    int columnOffset = info.Length() > 2 ? info[2].As<Napi::Number>().Int32Value() : 0;

    auto map = SourceMapSchema::GetMap(mapBuffer.Data());

    std::vector<int> sources;
    auto sourcesArray = map->sources();
    sources.reserve(sourcesArray->size());
    auto sourcesEnd = sourcesArray->end();
    for (auto it = sourcesArray->begin(); it != sourcesEnd; ++it) {
        sources.push_back(this->_mapping_container.addSource(it->str()));
    }

    std::vector<int> names;
    auto namesArray = map->names();
    names.reserve(namesArray->size());
    auto namesEnd = namesArray->end();
    for (auto it = namesArray->begin(); it != namesEnd; ++it) {
        names.push_back(this->_mapping_container.addName(it->str()));
    }

    this->_mapping_container.createLinesIfUndefined(map->lineCount() + lineOffset);

    auto mappingLinesVector = this->_mapping_container.getMappingLinesVector();
    auto lines = map->lines();
    auto linesEnd = lines->end();
    for (auto linesIterator = map->lines()->begin(); linesIterator != linesEnd; ++linesIterator) {
        auto line = (*linesIterator);
        auto segments = line->segments();
        auto segmentsEnd = segments->end();

        auto mappingLine = mappingLinesVector[line->lineNumber()];
        bool isNewLine = mappingLine->_segments.empty();

        for (auto segmentIterator = segments->begin(); segmentIterator != segmentsEnd; ++segmentIterator) {
            Position generated = Position{segmentIterator->generatedLine() + lineOffset,
                                          segmentIterator->generatedColumn() + columnOffset};
            Position original = Position{segmentIterator->originalLine(), segmentIterator->originalColumn()};

            int source = segmentIterator->source() > -1 ? sources[segmentIterator->source()] : -1;
            int name = segmentIterator->name() > -1 ? names[segmentIterator->name()] : -1;
            this->_mapping_container.addMapping(generated, original, source, name);
        }

        if (isNewLine) {
            mappingLine->setIsSorted(line->isSorted());
        }
    }
}

void SourceMapBinding::extends(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected 1-3 parameters").ThrowAsJavaScriptException();
    }

    if (!info[0].IsBuffer()) {
        Napi::TypeError::New(env, "Expected a string for the first parameter").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 1 && !info[1].IsNumber()) {
        Napi::TypeError::New(env, "Expected a number for the second parameter").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 2 && !info[2].IsNumber()) {
        Napi::TypeError::New(env, "Expected a number for the third parameter").ThrowAsJavaScriptException();
        return;
    }

    auto mapBuffer = info[0].As<Napi::Buffer<uint8_t>>();
    auto map = SourceMapSchema::GetMap(mapBuffer.Data());

    std::vector<int> sources;
    auto sourcesArray = map->sources();
    sources.reserve(sourcesArray->size());
    auto sourcesEnd = sourcesArray->end();
    for (auto it = sourcesArray->begin(); it != sourcesEnd; ++it) {
        sources.push_back(this->_mapping_container.addSource(it->str()));
    }

    std::vector<int> names;
    auto namesArray = map->names();
    names.reserve(namesArray->size());
    auto namesEnd = namesArray->end();
    for (auto it = namesArray->begin(); it != namesEnd; ++it) {
        names.push_back(this->_mapping_container.addName(it->str()));
    }

    auto originalLines = map->lines();
    auto originalLineCount = map->lineCount();

    std::vector<flatbuffers::Offset<SourceMapSchema::MappingLine>> lines_vector;
    auto &mappingLinesVector = this->_mapping_container.getMappingLinesVector();
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

Napi::Value SourceMapBinding::stringify(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    Napi::Object obj = Napi::Object::New(env);
    obj.Set("mappings", this->_mapping_container.toVLQMappings());

    auto sourcesVector = this->_mapping_container.getSourcesVector();
    int len = sourcesVector.size();
    Napi::Array sourcesArray = Napi::Array::New(env, len);
    for (int i = 0; i < len; ++i) {
        sourcesArray.Set(i, sourcesVector[i]);
    }
    obj.Set("sources", sourcesArray);

    auto namesVector = this->_mapping_container.getNamesVector();
    len = namesVector.size();
    Napi::Array namesArray = Napi::Array::New(env, len);
    for (int i = 0; i < len; ++i) {
        namesArray.Set(i, namesVector[i]);
    }
    obj.Set("names", namesArray);

    return obj;
}

Napi::Value SourceMapBinding::toBuffer(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    flatbuffers::FlatBufferBuilder builder;

    // Sort mappings
    this->_mapping_container.sort();

    std::vector<flatbuffers::Offset<flatbuffers::String>> names_vector;
    auto namesVector = this->_mapping_container.getNamesVector();
    names_vector.reserve(namesVector.size());
    auto namesEnd = namesVector.end();
    for (auto it = namesVector.begin(); it != namesEnd; ++it) {
        names_vector.push_back(builder.CreateString(*it));
    }

    std::vector<flatbuffers::Offset<flatbuffers::String>> sources_vector;
    auto sourcesVector = this->_mapping_container.getSourcesVector();
    sources_vector.reserve(sourcesVector.size());
    auto sourcesEnd = sourcesVector.end();
    for (auto it = sourcesVector.begin(); it != sourcesEnd; ++it) {
        sources_vector.push_back(builder.CreateString(*it));
    }

    std::vector<flatbuffers::Offset<SourceMapSchema::MappingLine>> lines_vector;
    auto mappingLinesVector = this->_mapping_container.getMappingLinesVector();
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
                                                this->_mapping_container.getGeneratedLines(), &lines_vector);

    builder.Finish(map);

    return Napi::Buffer<uint8_t>::Copy(env, builder.GetBufferPointer(), builder.GetSize());
}

// returns the sorted and processed map with decoded vlqs and all other map data
Napi::Value SourceMapBinding::getMap(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    Napi::Object obj = Napi::Object::New(env);

    // Sort mappings
    this->_mapping_container.sort();

    auto sourcesVector = this->_mapping_container.getSourcesVector();
    int len = sourcesVector.size();
    Napi::Array sourcesArray = Napi::Array::New(env, len);
    for (int i = 0; i < len; ++i) {
        sourcesArray.Set(i, sourcesVector[i]);
    }
    obj.Set("sources", sourcesArray);

    auto namesVector = this->_mapping_container.getNamesVector();
    len = namesVector.size();
    Napi::Array namesArray = Napi::Array::New(env, len);
    for (int i = 0; i < len; ++i) {
        namesArray.Set(i, namesVector[i]);
    }
    obj.Set("names", namesArray);

    auto mappingLinesVector = this->_mapping_container.getMappingLinesVector();
    Napi::Array mappingsArray = Napi::Array::New(env, this->_mapping_container.getTotalSegments());
    auto lineEnd = mappingLinesVector.end();
    int currentMapping = 0;
    for (auto lineIterator = mappingLinesVector.begin(); lineIterator != lineEnd; ++lineIterator) {
        auto &line = (*lineIterator);
        auto &segments = line->_segments;
        auto segmentsEnd = segments.end();

        for (auto segmentIterator = segments.begin(); segmentIterator != segmentsEnd; ++segmentIterator) {
            Mapping &mapping = *segmentIterator;
            Napi::Object mappingObject = Napi::Object::New(env);
            Napi::Object generatedPositionObject = Napi::Object::New(env);

            generatedPositionObject.Set("line", mapping.generated.line);
            generatedPositionObject.Set("column", mapping.generated.column);
            mappingObject.Set("generated", generatedPositionObject);

            int mappingSource = mapping.source;
            if (mappingSource > -1) {
                Napi::Object originalPositionObject = Napi::Object::New(env);

                originalPositionObject.Set("line", mapping.original.line);
                originalPositionObject.Set("column", mapping.original.column);
                mappingObject.Set("original", originalPositionObject);

                mappingObject.Set("source", mappingSource);
            }

            int mappingName = mapping.name;
            if (mappingName > -1) {
                mappingObject.Set("name", mappingName);
            }

            mappingsArray.Set(currentMapping, mappingObject);

            ++currentMapping;
        }
    }
    obj.Set("mappings", mappingsArray);

    return obj;
}

// Gets called when object gets destroyed, use this instead of destructor...
void SourceMapBinding::Finalize(Napi::Env env) {
    Napi::HandleScope scope(env);
    this->_mapping_container.Finalize();
}

// addIndexedMappings(array<mapping>, lineOffset, columnOffset): uses numbers for source and name with the index specified in the sources/names map/array in SourceMap instance
void SourceMapBinding::addIndexedMappings(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected 1-3 parameters").ThrowAsJavaScriptException();
    }

    if (!info[0].IsArray()) {
        Napi::TypeError::New(env, "First parameter should be an array").ThrowAsJavaScriptException();
    }

    if (info.Length() > 1 && !info[1].IsNumber()) {
        Napi::TypeError::New(env,
                             "Second parameter should be a lineOffset of type integer").ThrowAsJavaScriptException();
    }

    if (info.Length() > 2 && !info[2].IsNumber()) {
        Napi::TypeError::New(env,
                             "Third parameter should be a lineOffset of type integer").ThrowAsJavaScriptException();
    }

    const Napi::Array mappingsArray = info[0].As<Napi::Array>();
    int lineOffset = info.Length() > 1 ? info[1].As<Napi::Number>().Int32Value() : 0;
    int columnOffset = info.Length() > 2 ? info[2].As<Napi::Number>().Int32Value() : 0;

    unsigned int length = mappingsArray.Length();
    for (unsigned int i = 0; i < length; ++i) {
        Napi::Value mapping = mappingsArray.Get(i);
        Napi::Object mappingObject = mapping.As<Napi::Object>();

        Napi::Object generated = mappingObject.Get("generated").As<Napi::Object>();
        int generatedLine = generated.Get("line").As<Napi::Number>().Int32Value();
        int generatedColumn = generated.Get("column").As<Napi::Number>().Int32Value();
        Position generatedPosition = Position{generatedLine + lineOffset, generatedColumn + columnOffset};
        if (!mappingObject.Has("original")) {
            this->_mapping_container.addMapping(generatedPosition);
        } else {
            Napi::Object original = mappingObject.Get("original").As<Napi::Object>();
            int originalLine = original.Get("line").As<Napi::Number>().Int32Value();
            int originalColumn = original.Get("column").As<Napi::Number>().Int32Value();
            Position originalPosition = Position{originalLine, originalColumn};

            int source;
            if (mappingObject.Get("source").IsString()) {
                source = this->_mapping_container.addSource(mappingObject.Get("source").As<Napi::String>().Utf8Value());
            } else {
                source = mappingObject.Get("source").As<Napi::Number>().Int32Value();
            }

            if (!mappingObject.Has("name")) {
                this->_mapping_container.addMapping(generatedPosition, originalPosition, source);
            } else {
                int name = -1;
                if (mappingObject.Get("name").IsString()) {
                    std::string nameString = mappingObject.Get("name").As<Napi::String>().Utf8Value();
                    if (nameString.size() > 0) {
                        name = this->_mapping_container.addName(nameString);
                    }
                } else {
                    name = mappingObject.Get("name").As<Napi::Number>().Int32Value();
                }

                this->_mapping_container.addMapping(generatedPosition, originalPosition, source, name);
            }
        }
    }
}

Napi::Value SourceMapBinding::getSourceIndex(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected a single string parameter").ThrowAsJavaScriptException();
    }

    std::string source = info[0].As<Napi::String>().Utf8Value();
    int index = this->_mapping_container.getSourceIndex(source);

    return Napi::Number::New(env, index);
}

Napi::Value SourceMapBinding::getNameIndex(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected a single string parameter").ThrowAsJavaScriptException();
    }

    std::string name = info[0].As<Napi::String>().Utf8Value();
    int index = this->_mapping_container.getNameIndex(name);

    return Napi::Number::New(env, index);
}

std::vector<int> SourceMapBinding::_addNames(Napi::Array &namesArray) {
    std::vector<int> insertions;
    int length = namesArray.Length();
    for (int i = 0; i < length; ++i) {
        Napi::Value name = namesArray.Get(i);

        insertions.push_back(this->_mapping_container.addName(name.As<Napi::String>().Utf8Value()));
    }
    return insertions;
}

Napi::Value SourceMapBinding::addNames(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() != 1 || !info[0].IsArray()) {
        Napi::TypeError::New(env, "Expected one parameter of type Array<string>").ThrowAsJavaScriptException();
    }

    Napi::Array arr = info[0].As<Napi::Array>();
    std::vector<int> indexes = this->_addNames(arr);
    int size = indexes.size();
    Napi::Array indexesArr = Napi::Array::New(env, size);
    for (int i = 0; i < size; ++i) {
        indexesArr.Set(i, Napi::Number::New(env, indexes[i]));
    }
    return indexesArr;
}

std::vector<int> SourceMapBinding::_addSources(Napi::Array &sourcesArray) {
    std::vector<int> insertions;
    unsigned int length = sourcesArray.Length();
    for (unsigned int i = 0; i < length; ++i) {
        Napi::Value source = sourcesArray.Get(i);

        insertions.push_back(this->_mapping_container.addSource(source.As<Napi::String>().Utf8Value()));
    }
    return insertions;
}

Napi::Value SourceMapBinding::addSources(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() != 1 || !info[0].IsArray()) {
        Napi::TypeError::New(env, "Expected one parameter of type Array<string>").ThrowAsJavaScriptException();
    }

    Napi::Array arr = info[0].As<Napi::Array>();
    std::vector<int> indexes = this->_addSources(arr);
    int size = indexes.size();
    Napi::Array indexesArr = Napi::Array::New(env, size);
    for (int i = 0; i < size; ++i) {
        indexesArr.Set(i, Napi::Number::New(env, indexes[i]));
    }
    return indexesArr;
}

Napi::FunctionReference SourceMapBinding::constructor;

Napi::Object SourceMapBinding::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "SourceMap", {
            InstanceMethod("addRawMappings", &SourceMapBinding::addRawMappings),
            InstanceMethod("addBufferMappings", &SourceMapBinding::addBufferMappings),
            InstanceMethod("stringify", &SourceMapBinding::stringify),
            InstanceMethod("toBuffer", &SourceMapBinding::toBuffer),
            InstanceMethod("getMap", &SourceMapBinding::getMap),
            InstanceMethod("addIndexedMappings", &SourceMapBinding::addIndexedMappings),
            InstanceMethod("addNames", &SourceMapBinding::addNames),
            InstanceMethod("addSources", &SourceMapBinding::addSources),
            InstanceMethod("getSourceIndex", &SourceMapBinding::getSourceIndex),
            InstanceMethod("getNameIndex", &SourceMapBinding::getNameIndex),
            InstanceMethod("extends", &SourceMapBinding::extends),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("SourceMap", func);
    return exports;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return SourceMapBinding::Init(env, exports);
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init);
