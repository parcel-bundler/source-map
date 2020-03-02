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

    if (!info[1].IsNumber() || !info[2].IsNumber()) {
        Napi::TypeError::New(env,
                             "Second and third parameter should be a positive number").ThrowAsJavaScriptException();
    }

    if (info.Length() > 3 && !info[3].IsNumber()) {
        Napi::TypeError::New(env, "Fourth parameter should be a positive number").ThrowAsJavaScriptException();
    }

    if (info.Length() > 4 && !info[4].IsNumber()) {
        Napi::TypeError::New(env, "Fifth parameter should be a positive number").ThrowAsJavaScriptException();
    }

    std::string rawMappings = info[0].As<Napi::String>().Utf8Value().c_str();
    unsigned int sources = info[1].As<Napi::Number>().Uint32Value();
    unsigned int names = info[2].As<Napi::Number>().Uint32Value();
    unsigned int lineOffset = info.Length() > 3 ? info[3].As<Napi::Number>().Uint32Value() : 0;
    unsigned int columnOffset = info.Length() > 4 ? info[4].As<Napi::Number>().Uint32Value() : 0;

    this->_mapping_container.addVLQMappings(rawMappings, lineOffset, columnOffset);
    this->_mapping_container.addNames(names);
    this->_mapping_container.addSources(sources);
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
    int sources = this->_mapping_container.getSources();
    int names = this->_mapping_container.getNames();

    this->_mapping_container.reserve(map->mappings()->size());
    auto it = map->mappings()->begin();
    auto end = map->mappings()->end();
    for (; it != end; ++it) {
        Position generated = {
                .line = it->generatedLine() + second,
                .column = it->generatedColumn() + third,
        };

        Position original = {
                .line = it->originalLine(),
                .column = it->originalColumn(),
        };

        this->_mapping_container.addMapping(generated, original, it->source() > -1 ? it->source() + sources : -1,
                                            it->name() > -1 ? it->name() + names : -1);
    }

    this->_mapping_container.addSources(map->sources());
    this->_mapping_container.addNames(map->names());
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
    auto it = mappingsVector.begin();
    auto end = mappingsVector.end();
    for (; it != end; ++it) {
        Mapping mapping = *it;
        mappings_vector.push_back(
                SourceMapSchema::Mapping(mapping.generated.line, mapping.generated.column, mapping.original.line,
                                         mapping.original.column, mapping.source, mapping.name));
    }

    auto map = SourceMapSchema::CreateMapDirect(builder, this->_mapping_container.getNames(),
                                                this->_mapping_container.getSources(), &mappings_vector);

    builder.Finish(map);

    return Napi::Buffer<uint8_t>::Copy(env, builder.GetBufferPointer(), builder.GetSize());
}

// Gets called when object gets destroyed, use this instead of destructor...
void SourceMapBinding::Finalize(Napi::Env env) {
    Napi::HandleScope scope(env);
    this->_mapping_container.Finalize();
}

Napi::FunctionReference SourceMapBinding::constructor;

Napi::Object SourceMapBinding::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "SourceMap", {
            InstanceMethod("addRawMappings", &SourceMapBinding::addRawMappings),
            InstanceMethod("addBufferMappings", &SourceMapBinding::addBufferMappings),
            InstanceMethod("toString", &SourceMapBinding::toString),
            InstanceMethod("toBuffer", &SourceMapBinding::toBuffer),
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
