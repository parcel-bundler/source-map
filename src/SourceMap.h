#include <napi.h>
#include <string>
#include "MappingContainer.h"

class SourceMapBinding : public Napi::ObjectWrap<SourceMapBinding> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);

    SourceMapBinding(const Napi::CallbackInfo &info);

    ~SourceMapBinding();

    void Finalize(Napi::Env env);

private:
    static Napi::FunctionReference constructor;

    void addRawMappings(const Napi::CallbackInfo &info);

    void addBufferMappings(const Napi::CallbackInfo &info);

    Napi::Value findByOriginal(const Napi::CallbackInfo &info);

    Napi::Value findByGenerated(const Napi::CallbackInfo &info);

    Napi::Value addIndexedMappings(const Napi::CallbackInfo &info);

    Napi::Value addStringMappings(const Napi::CallbackInfo &info);

    std::vector<int> _addSources(Napi::Array &sourcesArray);

    std::vector<int> _addNames(Napi::Array &namesArray);

    Napi::Value addSources(const Napi::CallbackInfo &info);

    Napi::Value addNames(const Napi::CallbackInfo &info);

    Napi::Value getMap(const Napi::CallbackInfo &info);

    Napi::Value stringify(const Napi::CallbackInfo &info);

    Napi::Value toBuffer(const Napi::CallbackInfo &info);

    Napi::Value getSourceIndex(const Napi::CallbackInfo &info);

    Napi::Value getNameIndex(const Napi::CallbackInfo &info);

    MappingContainer _mapping_container;
};
