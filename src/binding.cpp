#include "binding.h"

Napi::FunctionReference SourceMapBinding::constructor;

Napi::Object SourceMapBinding::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "SourceMap", {
            InstanceMethod("fromString", &SourceMapBinding::fromString),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("SourceMap", func);
    return exports;
}

SourceMapBinding::SourceMapBinding(const Napi::CallbackInfo& info) : Napi::ObjectWrap<SourceMapBinding>(info)  {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    this->_sourceMap = new SourceMap();
}

Napi::Value SourceMapBinding::fromString(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() != 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String expected").ThrowAsJavaScriptException();
    }

    Napi::String first = info[0].As<Napi::String>();
    this->GetInternalInstance()->fromString(first.Utf8Value());

    return Napi::Number::New(env, 1);
}

SourceMap* SourceMapBinding::GetInternalInstance() {
    return this->_sourceMap;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return SourceMapBinding::Init(env, exports);
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)