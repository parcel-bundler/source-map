#include <napi.h>
#include <string>
#include "MappingContainer.h"

class SourceMapBinding : public Napi::ObjectWrap<SourceMapBinding> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);

    SourceMapBinding(const Napi::CallbackInfo &info);

    ~SourceMapBinding();

private:
    void addRawMappings(const Napi::CallbackInfo &info);

    void addBufferMappings(const Napi::CallbackInfo &info);

    void addIndexedMappings(const Napi::CallbackInfo &info);

    void extends(const Napi::CallbackInfo &info);

    void addEmptyMap(const Napi::CallbackInfo &info);

    void setSourceContent(const Napi::CallbackInfo &info);

    void offsetLines(const Napi::CallbackInfo &info);

    void offsetColumns(const Napi::CallbackInfo &info);

    std::vector<int> _addSources(Napi::Array &sourcesArray, Napi::Array &sourcesContentArray);

    std::vector<int> _addNames(Napi::Array &namesArray);

    Napi::Value addSource(const Napi::CallbackInfo &info);

    Napi::Value addName(const Napi::CallbackInfo &info);

    Napi::Value getMap(const Napi::CallbackInfo &info);

    Napi::Value stringify(const Napi::CallbackInfo &info);

    Napi::Value toBuffer(const Napi::CallbackInfo &info);

    Napi::Value getSourceIndex(const Napi::CallbackInfo &info);

    Napi::Value getSource(const Napi::CallbackInfo &info);

    Napi::Value getSourceContent(const Napi::CallbackInfo &info);

    Napi::Value getNameIndex(const Napi::CallbackInfo &info);

    Napi::Value getName(const Napi::CallbackInfo &info);

    Napi::Value findClosestMapping(const Napi::CallbackInfo &info);

    Napi::Object _mappingToObject(Napi::Env env, Mapping &mapping);

    MappingContainer _mapping_container;
};
