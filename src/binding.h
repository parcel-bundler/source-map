#include <napi.h>
#include <string>
#include "SourceMap.h"

class SourceMapBinding : public Napi::ObjectWrap<SourceMapBinding> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);

    SourceMapBinding(const Napi::CallbackInfo &info);

    ~SourceMapBinding();

    SourceMap *GetInternalInstance();

    void Finalize(Napi::Env env);

private:
    static Napi::FunctionReference constructor;

    void addMappings(const Napi::CallbackInfo &info);

    Napi::Value toString(const Napi::CallbackInfo &info);

    SourceMap *_sourceMap = nullptr;
};
