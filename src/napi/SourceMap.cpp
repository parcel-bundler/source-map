#include <sstream>
#include "SourceMap.h"
#include "sourcemap-schema_generated.h"

SourceMapBinding::SourceMapBinding(const Napi::CallbackInfo &info) : Napi::ObjectWrap<SourceMapBinding>(info) {
    // Just create instance...
}

SourceMapBinding::~SourceMapBinding() {}

void SourceMapBinding::addRawMappings(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 3) {
        Napi::TypeError::New(env, "Expected 3-5 parameters").ThrowAsJavaScriptException();
        return;
    }

    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "First parameter should be a string").ThrowAsJavaScriptException();
        return;
    }

    if (!info[1].IsArray() || !info[2].IsArray()) {
        Napi::TypeError::New(env,
                             "Second and third parameter should be an array of strings").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 3 && !info[3].IsNumber()) {
        Napi::TypeError::New(env, "Fourth parameter should be a positive number").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 4 && !info[4].IsNumber()) {
        Napi::TypeError::New(env, "Fifth parameter should be a positive number").ThrowAsJavaScriptException();
        return;
    }

    std::string rawMappings = info[0].As<Napi::String>().Utf8Value();
    Napi::Array sources = info[1].As<Napi::Array>();
    Napi::Array names = info[2].As<Napi::Array>();
    int lineOffset = info.Length() > 3 ? info[3].As<Napi::Number>().Int32Value() : 0;
    int columnOffset = info.Length() > 4 ? info[4].As<Napi::Number>().Int32Value() : 0;

    std::vector<int> namesIndex = _addNames(names);
    std::vector<int> sourcesIndex = _addSources(sources);

    _mapping_container.addVLQMappings(rawMappings, sourcesIndex, namesIndex, lineOffset, columnOffset);
}

void SourceMapBinding::addBufferMappings(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected 1-3 parameters").ThrowAsJavaScriptException();
        return;
    }

    if (!info[0].IsBuffer()) {
        Napi::TypeError::New(env, "Expected a Buffer for the first parameter").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 1 && !info[1].IsNumber()) {
        Napi::TypeError::New(env,
                             "Expected a lineOffset of type integer for the second parameter").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 2 && !info[2].IsNumber()) {
        Napi::TypeError::New(env,
                             "Expected a columnOffset of type integer for the third parameter").ThrowAsJavaScriptException();
        return;
    }

    auto mapBuffer = info[0].As<Napi::Buffer<uint8_t>>();
    int lineOffset = info.Length() > 1 ? info[1].As<Napi::Number>().Int32Value() : 0;
    int columnOffset = info.Length() > 2 ? info[2].As<Napi::Number>().Int32Value() : 0;

    _mapping_container.addBufferMappings(mapBuffer.Data(), lineOffset, columnOffset);
}

void SourceMapBinding::extends(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected 1 parameter of type buffer").ThrowAsJavaScriptException();
        return;
    }

    if (!info[0].IsBuffer()) {
        Napi::TypeError::New(env, "Expected a buffer for the first parameter").ThrowAsJavaScriptException();
        return;
    }

    auto mapBuffer = info[0].As<Napi::Buffer<uint8_t>>();
    _mapping_container.extends(mapBuffer.Data());
}

Napi::Value SourceMapBinding::stringify(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    Napi::Object obj = Napi::Object::New(env);
    obj.Set("mappings", _mapping_container.toVLQMappings());

    auto sourcesVector = _mapping_container.getSourcesVector();
    int len = sourcesVector.size();
    Napi::Array sourcesArray = Napi::Array::New(env, len);
    for (int i = 0; i < len; ++i) {
        sourcesArray.Set(i, sourcesVector[i]);
    }
    obj.Set("sources", sourcesArray);

    auto namesVector = _mapping_container.getNamesVector();
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
    auto builder = _mapping_container.toBuffer();
    return Napi::Buffer<uint8_t>::Copy(env, builder.GetBufferPointer(), builder.GetSize());
}

Napi::Object SourceMapBinding::_mappingToObject(Napi::Env env, Mapping &mapping) {
    Napi::Object mappingObject = Napi::Object::New(env);
    Napi::Object generatedPositionObject = Napi::Object::New(env);

    generatedPositionObject.Set("line", mapping.generated.line + 1);
    generatedPositionObject.Set("column", mapping.generated.column);
    mappingObject.Set("generated", generatedPositionObject);

    int mappingSource = mapping.source;
    if (mappingSource > -1) {
        Napi::Object originalPositionObject = Napi::Object::New(env);

        originalPositionObject.Set("line", mapping.original.line + 1);
        originalPositionObject.Set("column", mapping.original.column);
        mappingObject.Set("original", originalPositionObject);

        mappingObject.Set("source", mappingSource);
    }

    int mappingName = mapping.name;
    if (mappingName > -1) {
        mappingObject.Set("name", mappingName);
    }

    return mappingObject;
}

// returns the sorted and processed map with decoded vlqs and all other map data
Napi::Value SourceMapBinding::getMap(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    Napi::Object obj = Napi::Object::New(env);

    // Sort mappings
    _mapping_container.sort();

    auto sourcesVector = _mapping_container.getSourcesVector();
    int len = sourcesVector.size();
    Napi::Array sourcesArray = Napi::Array::New(env, len);
    for (int i = 0; i < len; ++i) {
        sourcesArray.Set(i, sourcesVector[i]);
    }
    obj.Set("sources", sourcesArray);

    auto namesVector = _mapping_container.getNamesVector();
    len = namesVector.size();
    Napi::Array namesArray = Napi::Array::New(env, len);
    for (int i = 0; i < len; ++i) {
        namesArray.Set(i, namesVector[i]);
    }
    obj.Set("names", namesArray);

    auto mappingLinesVector = _mapping_container.getMappingLinesVector();
    Napi::Array mappingsArray = Napi::Array::New(env, _mapping_container.getTotalSegments());
    auto lineEnd = mappingLinesVector.end();
    int currentMapping = 0;
    for (auto lineIterator = mappingLinesVector.begin(); lineIterator != lineEnd; ++lineIterator) {
        auto &line = (*lineIterator);
        auto &segments = line->_segments;
        auto segmentsEnd = segments.end();

        for (auto segmentIterator = segments.begin(); segmentIterator != segmentsEnd; ++segmentIterator) {
            Mapping &mapping = *segmentIterator;
            mappingsArray.Set(currentMapping, _mappingToObject(env, mapping));
            ++currentMapping;
        }
    }
    obj.Set("mappings", mappingsArray);

    return obj;
}

// addIndexedMappings(array<mapping>, lineOffset, columnOffset): uses numbers for source and name with the index specified in the sources/names map/array in SourceMap instance
void SourceMapBinding::addIndexedMappings(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected 1-3 parameters").ThrowAsJavaScriptException();
        return;
    }

    if (!info[0].IsArray()) {
        Napi::TypeError::New(env, "First parameter should be an array").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 1 && !info[1].IsNumber()) {
        Napi::TypeError::New(env,
                             "Second parameter should be a lineOffset of type integer").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 2 && !info[2].IsNumber()) {
        Napi::TypeError::New(env,
                             "Third parameter should be a lineOffset of type integer").ThrowAsJavaScriptException();
        return;
    }

    const Napi::Array mappingsArray = info[0].As<Napi::Array>();
    int lineOffset = info.Length() > 1 ? info[1].As<Napi::Number>().Int32Value() : 0;
    int columnOffset = info.Length() > 2 ? info[2].As<Napi::Number>().Int32Value() : 0;

    unsigned int length = mappingsArray.Length();
    for (unsigned int i = 0; i < length; ++i) {
        if (!mappingsArray.Has(i)) {
            continue;
        }

        Napi::Value mappingValue = mappingsArray.Get(i);
        if (!mappingValue.IsObject()) {
            continue;
        }

        Napi::Object mappingObject = mappingValue.As<Napi::Object>();
        if (!mappingObject.Has("generated")) {
            continue;
        }

        Napi::Object generated = mappingObject.Get("generated").As<Napi::Object>();
        if (!generated.Has("line") || !generated.Has("column")) {
            continue;
        }

        int generatedLine = generated.Get("line").As<Napi::Number>().Int32Value() + lineOffset - 1;
        int generatedColumn = generated.Get("column").As<Napi::Number>().Int32Value() + columnOffset;
        Position generatedPosition = Position{generatedLine, generatedColumn};
        Position originalPosition = Position{-1, -1};
        int sourceIndex = -1;
        int nameIndex = -1;

        if (mappingObject.Has("original")) {
            Napi::Value originalPositionValue = mappingObject.Get("original");
            if (originalPositionValue.IsObject()) {
                Napi::Object originalPositionObject = originalPositionValue.As<Napi::Object>();
                if (originalPositionObject.Has("line") && originalPositionObject.Has("column")) {
                    originalPosition.line = originalPositionObject.Get("line").As<Napi::Number>().Int32Value() - 1;
                    originalPosition.column = originalPositionObject.Get("column").As<Napi::Number>().Int32Value();
                }

                if (mappingObject.Has("source")) {
                    Napi::Value sourceValue = mappingObject.Get("source");
                    if (sourceValue.IsString()) {
                        std::string sourceString = mappingObject.Get("source").As<Napi::String>().Utf8Value();
                        sourceIndex = _mapping_container.addSource(sourceString);
                    }
                }

                if (mappingObject.Has("name")) {
                    Napi::Value nameValue = mappingObject.Get("name");
                    if (nameValue.IsString()) {
                        std::string nameString = nameValue.As<Napi::String>().Utf8Value();
                        nameIndex = _mapping_container.addName(nameString);
                    }
                }
            }
        }

        _mapping_container.addMapping(generatedPosition, originalPosition, sourceIndex, nameIndex);
    }
}

Napi::Value SourceMapBinding::getSourceIndex(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected a single string parameter").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string source = info[0].As<Napi::String>().Utf8Value();
    int index = _mapping_container.getSourceIndex(source);

    return Napi::Number::New(env, index);
}

Napi::Value SourceMapBinding::getNameIndex(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected a single string parameter").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string name = info[0].As<Napi::String>().Utf8Value();
    int index = _mapping_container.getNameIndex(name);

    return Napi::Number::New(env, index);
}

std::vector<int> SourceMapBinding::_addNames(Napi::Array &namesArray) {
    std::vector<int> insertions;
    int length = namesArray.Length();
    for (int i = 0; i < length; ++i) {
        std::string name = namesArray.Get(i).As<Napi::String>().Utf8Value();
        insertions.push_back(_mapping_container.addName(name));
    }
    return insertions;
}

Napi::Value SourceMapBinding::addNames(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() != 1 || !info[0].IsArray()) {
        Napi::TypeError::New(env, "Expected one parameter of type Array<string>").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Array arr = info[0].As<Napi::Array>();
    std::vector<int> indexes = _addNames(arr);
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
        std::string source = sourcesArray.Get(i).As<Napi::String>().Utf8Value();
        insertions.push_back(_mapping_container.addSource(source));
    }
    return insertions;
}

Napi::Value SourceMapBinding::addSources(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() != 1 || !info[0].IsArray()) {
        Napi::TypeError::New(env, "Expected one parameter of type Array<string>").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Array arr = info[0].As<Napi::Array>();
    std::vector<int> indexes = _addSources(arr);
    int size = indexes.size();
    Napi::Array indexesArr = Napi::Array::New(env, size);
    for (int i = 0; i < size; ++i) {
        indexesArr.Set(i, Napi::Number::New(env, indexes[i]));
    }
    return indexesArr;
}

void SourceMapBinding::addEmptyMap(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 2 || !info[0].IsString() || !info[1].IsString()) {
        Napi::TypeError::New(env,
                             "Expected 2-4 parameters of type String: (sourceName, sourceContent, lineOffset = 0)").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() == 3 && !info[2].IsNumber()) {
        Napi::TypeError::New(env,
                             "Expected third parameter to be a lineOffset of type Integer").ThrowAsJavaScriptException();
        return;
    }

    std::string sourceName = info[0].As<Napi::String>().Utf8Value();
    std::string sourceContent = info[1].As<Napi::String>().Utf8Value();
    int lineOffset = info.Length() > 2 ? info[2].As<Napi::Number>().Int32Value() : 0;

    _mapping_container.addEmptyMap(sourceName, sourceContent, lineOffset);
}

Napi::Value SourceMapBinding::findClosestMapping(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsNumber()) {
        Napi::TypeError::New(env, "Expected 1 parameter of type buffer").ThrowAsJavaScriptException();
        return env.Null();
    }

    Mapping m = _mapping_container.findClosestMapping(info[0].As<Napi::Number>().Int32Value() - 1,
                                                      info[1].As<Napi::Number>().Int32Value());
    return _mappingToObject(env, m);
}

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
            InstanceMethod("addEmptyMap", &SourceMapBinding::addEmptyMap),
            InstanceMethod("findClosestMapping", &SourceMapBinding::findClosestMapping),
    });

    exports.Set("SourceMap", func);
    return exports;
}

NAPI_MODULE_INIT(/* env, exports */) {
    return SourceMapBinding::Init(env, Napi::Object(env, exports));
}
