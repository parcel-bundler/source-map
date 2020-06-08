#include <string>
#include "MappingContainer.h"
#include <emscripten/bind.h>

class SourceMap {
public:
    SourceMap();
    ~SourceMap();

    void addRawMappings(std::string rawMappings, std::vector<std::string> sources, std::vector<std::string> sourcesContent, std::vector<std::string> names, int lineOffset, int columnOffset);
    void addBufferMappings(std::string mapbuffer, int lineOffset, int columnOffset);
    void addIndexedMapping(int generatedLine, int generatedColumn, int originalLine, int originalColumn, std::string source, std::string name);

    void extends(std::string mapBuffer);

    void addEmptyMap(std::string sourceName, std::string sourceContent, int lineOffset);
    std::vector<int> addSources(std::vector<std::string> &sourcesArray);
    std::vector<int> addNames(std::vector<std::string> &namesArray);
    int addSource(std::string source);
    int addName(std::string name);

    std::string getVLQMappings();
    std::vector<Mapping> getMappings();
    std::vector<std::string> getSources();
    std::vector<std::string> getNames();
    emscripten::val toBuffer();
    int getSourceIndex(std::string source);
    std::string getSource(int index);
    int getNameIndex(std::string name);
    std::string getName(int index);
    std::string getSourceContent(std::string sourceName);
    void setSourceContent(std::string sourceName, std::string sourceContent);
    std::vector<std::string> getSourcesContent();

    Mapping findClosestMapping(int line, int column);

private:
    MappingContainer _mapping_container;
};
