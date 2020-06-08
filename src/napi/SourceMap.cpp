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

    if (info.Length() < 4) {
        Napi::TypeError::New(env, "Expected 4-5 parameters").ThrowAsJavaScriptException();
        return;
    }

    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "First parameter should be a string").ThrowAsJavaScriptException();
        return;
    }

    if (!info[1].IsArray() || !info[2].IsArray() || !info[3].IsArray()) {
        Napi::TypeError::New(env,
                             "Second, third and fourth parameter should be an array of strings").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 4 && !info[4].IsNumber()) {
        Napi::TypeError::New(env, "Fifth parameter should be a number").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 5 && !info[5].IsNumber()) {
        Napi::TypeError::New(env, "Sixth parameter should be a number").ThrowAsJavaScriptException();
        return;
    }

    std::string rawMappings = info[0].As<Napi::String>().Utf8Value();
    Napi::Array sources = info[1].As<Napi::Array>();
    Napi::Array sourcesContent = info[2].As<Napi::Array>();
    Napi::Array names = info[3].As<Napi::Array>();
    int lineOffset = info.Length() > 4 ? info[4].As<Napi::Number>().Int32Value() : 0;
    int columnOffset = info.Length() > 5 ? info[5].As<Napi::Number>().Int32Value() : 0;

    std::vector<int> namesIndex = _addNames(names);
    std::vector<int> sourcesIndex = _addSources(sources, sourcesContent);

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

    auto sourcesContentVector = _mapping_container.getSourcesContentVector();
    len = sourcesContentVector.size();
    Napi::Array sourcesContentArray = Napi::Array::New(env, len);
    for (int i = 0; i < len; ++i) {
        sourcesContentArray.Set(i, sourcesContentVector[i]);
    }
    obj.Set("sourcesContent", sourcesContentArray);

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

    auto sourcesContentVector = _mapping_container.getSourcesContentVector();
    len = sourcesContentVector.size();
    Napi::Array sourcesContentArray = Napi::Array::New(env, len);
    for (int i = 0; i < len; ++i) {
        sourcesContentArray.Set(i, sourcesContentVector[i]);
    }
    obj.Set("sourcesContent", sourcesContentArray);

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
        auto &segments = line._segments;
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

// addIndexedMapping(generatedLine, generatedColumn, originalLine, originalColumn, source, name)
void SourceMapBinding::addIndexedMapping(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 6) {
        Napi::TypeError::New(env, "Expected 6 parameters").ThrowAsJavaScriptException();
        return;
    }

    int generatedLine = info[0].As<Napi::Number>().Int32Value();
    int generatedColumn = info[1].As<Napi::Number>().Int32Value();
    int originalLine = info[2].As<Napi::Number>().Int32Value();
    int originalColumn = info[3].As<Napi::Number>().Int32Value();
    std::string source = info[4].As<Napi::String>().Utf8Value();
    std::string name = info[5].As<Napi::String>().Utf8Value();

    _mapping_container.addIndexedMapping(generatedLine, generatedColumn, originalLine, originalColumn, source, name);
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


Napi::Value SourceMapBinding::getSource(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected a single number parameter").ThrowAsJavaScriptException();
        return env.Null();
    }

    int index = info[0].As<Napi::Number>().Int32Value();
    return Napi::String::New(env, _mapping_container.getSource(index));
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

Napi::Value SourceMapBinding::getName(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected a single number parameter").ThrowAsJavaScriptException();
        return env.Null();
    }

    int index = info[0].As<Napi::Number>().Int32Value();
    return Napi::String::New(env, _mapping_container.getName(index));
}

std::vector<int> SourceMapBinding::_addNames(Napi::Array &namesArray) {
    std::vector<int> insertions;
    insertions.reserve(namesArray.Length());
    int length = namesArray.Length();
    for (int i = 0; i < length; ++i) {
        std::string name = namesArray.Get(i).As<Napi::String>().Utf8Value();
        insertions.push_back(_mapping_container.addName(name));
    }
    return insertions;
}

Napi::Value SourceMapBinding::addName(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() != 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected one parameter of type string").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string name = info[0].As<Napi::String>().Utf8Value();
    return Napi::Number::New(env, _mapping_container.addName(name));
}

std::vector<int> SourceMapBinding::_addSources(Napi::Array &sourcesArray, Napi::Array &sourcesContentArray) {
    std::vector<int> insertions;
    insertions.reserve(sourcesArray.Length());
    unsigned int length = sourcesArray.Length();
    for (unsigned int i = 0; i < length; ++i) {
        std::string sourceName = sourcesArray.Get(i).As<Napi::String>().Utf8Value();
        std::string sourceContent = "";
        if (sourcesContentArray.Length() > i) {
            sourceContent = sourcesContentArray.Get(i).As<Napi::String>().Utf8Value();
        }

        int sourceIndex = _mapping_container.addSource(sourceName);
        _mapping_container.setSourceContent(sourceIndex, sourceContent);
        insertions.push_back(sourceIndex);
    }
    return insertions;
}

Napi::Value SourceMapBinding::addSource(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() != 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected one parameter of type string").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string source = info[0].As<Napi::String>().Utf8Value();
    return Napi::Number::New(env, _mapping_container.addSource(source));
}

void SourceMapBinding::setSourceContent(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 2 || !info[0].IsString() || !info[1].IsString()) {
        Napi::TypeError::New(env,
                             "Expected 2 parameters of type String: sourceName and sourceContent").ThrowAsJavaScriptException();
        return;
    }

    std::string sourceName = info[0].As<Napi::String>().Utf8Value();
    std::string sourceContent = info[1].As<Napi::String>().Utf8Value();

    _mapping_container.setSourceContent(_mapping_container.addSource(sourceName), sourceContent);
}

Napi::Value SourceMapBinding::getSourceContent(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected a single string parameter").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string sourceName = info[0].As<Napi::String>().Utf8Value();
    return Napi::String::New(env, _mapping_container.getSourceContent(_mapping_container.getSourceIndex(sourceName)));
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
            InstanceMethod("addIndexedMapping", &SourceMapBinding::addIndexedMapping),
            InstanceMethod("addName", &SourceMapBinding::addName),
            InstanceMethod("addSource", &SourceMapBinding::addSource),
            InstanceMethod("setSourceContent", &SourceMapBinding::setSourceContent),
            InstanceMethod("getSourceContent", &SourceMapBinding::getSourceContent),
            InstanceMethod("getSourceIndex", &SourceMapBinding::getSourceIndex),
            InstanceMethod("getSource", &SourceMapBinding::getSource),
            InstanceMethod("getNameIndex", &SourceMapBinding::getNameIndex),
            InstanceMethod("getName", &SourceMapBinding::getName),
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
