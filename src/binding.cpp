#include <iostream>

#include "binding.h"

Napi::FunctionReference SourceMapBinding::constructor;

Napi::Object SourceMapBinding::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "SourceMap", {
            InstanceMethod("addMappings", &SourceMapBinding::addMappings),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("SourceMap", func);
    return exports;
}

SourceMapBinding::SourceMapBinding(const Napi::CallbackInfo& info) : Napi::ObjectWrap<SourceMapBinding>(info)  {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 3) {
        Napi::TypeError::New(env, "Expected 3-5 parameters").ThrowAsJavaScriptException();
    }

    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "First parameter should be a positive string").ThrowAsJavaScriptException();
    }

    if (!info[1].IsNumber() || !info[2].IsNumber()) {
        Napi::TypeError::New(env, "Second and third parameter should be a positive number").ThrowAsJavaScriptException();
    }

    if (info.Length() > 3 && !info[3].IsNumber()) {
        Napi::TypeError::New(env, "Fourth parameter should be a positive number").ThrowAsJavaScriptException();
    }

    if (info.Length() > 4 && !info[4].IsNumber()) {
        Napi::TypeError::New(env, "Fifth parameter should be a positive number").ThrowAsJavaScriptException();
    }

    try {
        const std::string first = info[0].As<Napi::String>().Utf8Value();
        const unsigned int second = info[1].As<Napi::Number>().Uint32Value();
        const unsigned int third = info[2].As<Napi::Number>().Uint32Value();
        const unsigned int fourth = info.Length() > 3 ? info[3].As<Napi::Number>().Uint32Value() : 0;
        const unsigned int fifth = info.Length() > 4 ? info[4].As<Napi::Number>().Uint32Value() : 0;

        this->_sourceMap = new SourceMap(&first, second, third, fourth, fifth);
    } catch(const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    }
}

void SourceMapBinding::addMappings(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 3) {
        Napi::TypeError::New(env, "Expected 3-5 parameters").ThrowAsJavaScriptException();
    }

    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "First parameter should be a positive string").ThrowAsJavaScriptException();
    }

    if (!info[1].IsNumber() || !info[2].IsNumber()) {
        Napi::TypeError::New(env, "Second and third parameter should be a positive number").ThrowAsJavaScriptException();
    }

    if (info.Length() > 3 && !info[3].IsNumber()) {
        Napi::TypeError::New(env, "Fourth parameter should be a positive number").ThrowAsJavaScriptException();
    }

    if (info.Length() > 4 && !info[4].IsNumber()) {
        Napi::TypeError::New(env, "Fifth parameter should be a positive number").ThrowAsJavaScriptException();
    }

    try {
        const std::string first = info[0].As<Napi::String>().Utf8Value();
        const unsigned int second = info[1].As<Napi::Number>().Uint32Value();
        const unsigned int third = info[2].As<Napi::Number>().Uint32Value();
        const unsigned int fourth = info.Length() > 3 ? info[3].As<Napi::Number>().Uint32Value() : 0;
        const unsigned int fifth = info.Length() > 4 ? info[4].As<Napi::Number>().Uint32Value() : 0;

        this->GetInternalInstance()->addMappings(&first, second, third, fourth, fifth);
    } catch(const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    }
}

SourceMap* SourceMapBinding::GetInternalInstance() {
    return this->_sourceMap;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return SourceMapBinding::Init(env, exports);
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)