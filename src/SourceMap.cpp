#include <iostream>

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

    this->_mapping_container.addVLQMappings(rawMappings, lineOffset, columnOffset,
                                            this->_mapping_container.getSourcesCount(),
                                            this->_mapping_container.getNamesCount());
    this->_addNames(names);
    this->_addSources(sources);
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

    auto first = info[0].As<Napi::Buffer<uint8_t>>();
    int second = info.Length() > 1 ? info[1].As<Napi::Number>().Int32Value() : 0;
    int third = info.Length() > 2 ? info[2].As<Napi::Number>().Int32Value() : 0;

    auto map = SourceMapSchema::GetMap(first.Data());
    int sources = this->_mapping_container.getSourcesCount();
    int names = this->_mapping_container.getNamesCount();

    this->_mapping_container.reserve(map->mappings()->size());
    auto mappingsIterator = map->mappings()->begin();
    auto mappingsEnd = map->mappings()->end();
    for (; mappingsIterator != mappingsEnd; ++mappingsIterator) {
        Position generated = {
                .line = mappingsIterator->generatedLine() + second,
                .column = mappingsIterator->generatedColumn() + third,
        };

        Position original = {
                .line = mappingsIterator->originalLine(),
                .column = mappingsIterator->originalColumn(),
        };

        this->_mapping_container.addMapping(generated, original, mappingsIterator->source() > -1 ? mappingsIterator->source() + sources : -1,
                                            mappingsIterator->name() > -1 ? mappingsIterator->name() + names : -1);
    }

    auto sourcesIterator = map->sources()->begin();
    auto sourcesEnd = map->sources()->end();
    for (; sourcesIterator != sourcesEnd; ++sourcesIterator) {
        this->_mapping_container.addSource(sourcesIterator->str());
    }

    auto namesIterator = map->names()->begin();
    auto namesEnd = map->names()->end();
    for (; namesIterator != namesEnd; ++namesIterator) {
        this->_mapping_container.addName(namesIterator->str());
    }
}

Napi::Value SourceMapBinding::toString(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    std::string s = this->_mapping_container.toVLQMappings();

    return Napi::String::New(env, s);
}

Napi::Value SourceMapBinding::toBuffer(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    flatbuffers::FlatBufferBuilder builder;

    std::vector<SourceMapSchema::Mapping> mappings_vector;
    auto mappingsVector = this->_mapping_container.getMappingsVector();
    mappings_vector.reserve(mappingsVector.size());
    auto mappingsIterator = mappingsVector.begin();
    auto mappingsIteratorEnd = mappingsVector.end();
    for (; mappingsIterator != mappingsIteratorEnd; ++mappingsIterator) {
        Mapping mapping = *mappingsIterator;
        mappings_vector.push_back(
                SourceMapSchema::Mapping(mapping.generated.line, mapping.generated.column, mapping.original.line,
                                         mapping.original.column, mapping.source, mapping.name));
    }

    std::vector<flatbuffers::Offset<flatbuffers::String>> names_vector;
    auto namesVector = this->_mapping_container.getNamesVector();
    names_vector.reserve(namesVector.size());
    auto namesIterator = namesVector.begin();
    auto namesEnd = namesVector.end();
    for (; namesIterator != namesEnd; ++namesIterator) {
        names_vector.push_back(builder.CreateString(*namesIterator));
    }

    std::vector<flatbuffers::Offset<flatbuffers::String>> sources_vector;
    auto sourcesVector = this->_mapping_container.getSourcesVector();
    sources_vector.reserve(sourcesVector.size());
    auto sourcesIterator = sourcesVector.begin();
    auto sourcesEnd = sourcesVector.end();
    for (; sourcesIterator != sourcesEnd; ++sourcesIterator) {
        sources_vector.push_back(builder.CreateString(*sourcesIterator));
    }

    auto map = SourceMapSchema::CreateMapDirect(builder, &names_vector, &sources_vector, &mappings_vector);

    builder.Finish(map);

    return Napi::Buffer<uint8_t>::Copy(env, builder.GetBufferPointer(), builder.GetSize());
}

// returns the sorted and processed map with decoded vlqs and all other map data
Napi::Value SourceMapBinding::getMap(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    return Napi::Value();
}

// Gets called when object gets destroyed, use this instead of destructor...
void SourceMapBinding::Finalize(Napi::Env env) {
    Napi::HandleScope scope(env);
    this->_mapping_container.Finalize();
}

// Finds a mapping based on generated location
Napi::Value SourceMapBinding::findByGenerated(const Napi::CallbackInfo &info) {
    return Napi::Value();
}

// Finds a mapping based on original location
Napi::Value SourceMapBinding::findByOriginal(const Napi::CallbackInfo &info) {
    return Napi::Value();
}

// addIndexedMappings(array<mapping>, lineOffset, columnOffset): uses numbers for source and name with the index specified in the sources/names map/array in SourceMap instance
Napi::Value SourceMapBinding::addIndexedMappings(const Napi::CallbackInfo &info) {
    return Napi::Value();
}

// TODO: Find better function name
// addIndexedMappings(array<mapping>, lineOffset, columnOffset): adds mappings that have a string value for name and source. These should be mapped to an index in SourceMap instance. (And added to the index if not found)
Napi::Value SourceMapBinding::addStringMappings(const Napi::CallbackInfo &info) {
    return Napi::Value();
}

std::vector<int> SourceMapBinding::_addNames(Napi::Array &namesArray) {
    std::vector<int> insertions;
    int i = 0;
    int length = namesArray.Length();
    for (; i < length; ++i) {
        auto name = namesArray.Get(i);

        // Not sure if this should throw an error or not
        if (!name.IsString()) {
            insertions.push_back(this->_mapping_container.addName(""));
        } else {
            insertions.push_back(this->_mapping_container.addName(name.As<Napi::String>().Utf8Value()));
        }
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
    int i = 0;
    for (; i < size; ++i) {
        indexesArr.Set(i, Napi::Number::New(env, indexes[i]));
    }
    return indexesArr;
}

std::vector<int> SourceMapBinding::_addSources(Napi::Array &sourcesArray){
    std::vector<int> insertions;
    int i = 0;
    int length = sourcesArray.Length();
    for (; i < length; ++i) {
        auto source = sourcesArray.Get(i);

        // Not sure if this should throw an error or not
        if (!source.IsString()) {
            insertions.push_back(this->_mapping_container.addName(""));
        } else {
            insertions.push_back(this->_mapping_container.addName(source.As<Napi::String>().Utf8Value()));
        }
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
    int i = 0;
    for (; i < size; ++i) {
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
            InstanceMethod("toString", &SourceMapBinding::toString),
            InstanceMethod("toBuffer", &SourceMapBinding::toBuffer),
            InstanceMethod("getMap", &SourceMapBinding::getMap),
            InstanceMethod("findByGenerated", &SourceMapBinding::findByGenerated),
            InstanceMethod("findByOriginal", &SourceMapBinding::findByOriginal),
            InstanceMethod("addIndexedMappings", &SourceMapBinding::addIndexedMappings),
            InstanceMethod("addStringMappings", &SourceMapBinding::addStringMappings),
            InstanceMethod("addNames", &SourceMapBinding::addNames),
            InstanceMethod("addSources", &SourceMapBinding::addSources),
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
