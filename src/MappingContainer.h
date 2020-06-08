#include <string>
#include <vector>
#include <unordered_map>
#include "MappingLine.h"
#include "sourcemap-schema_generated.h"

class MappingContainer {
public:
    MappingContainer();

    ~MappingContainer();

    void addMapping(Position generated, Position original = Position{-1, -1}, int source = -1, int name = -1);

    void addLine();

    void createLinesIfUndefined(int generatedLine);

    void addVLQMappings(const std::string &mappings_input, std::vector<int> &sources, std::vector<int> &names, int line_offset = 0, int column_offset = 0);

    std::string toVLQMappings();

    std::vector<std::string> &getSourcesVector();

    std::vector<std::string> &getSourcesContentVector();

    int addSource(std::string &sourceName);

    void setSourceContent(int sourceIndex, std::string &sourceContent);

    std::string getSourceContent(int sourceIndex);

    int getSourceIndex(std::string &source);

    std::string getSource(int sourceIndex);

    std::vector<std::string> &getNamesVector();

    int addName(std::string &name);

    int getNameIndex(std::string &name);

    std::string getName(int nameIndex);

    int getGeneratedLines();

    int getTotalSegments();

    std::vector<MappingLine> &getMappingLinesVector();

    void sort();

    Mapping findClosestMapping(int line, int column);

    void addEmptyMap(std::string& sourceName, std::string &sourceContent, int lineOffset = 0);

    flatbuffers::FlatBufferBuilder toBuffer();

    void extends(const void *buf);

    void addBufferMappings(const void *buf, int lineOffset = 0, int columnOffset = 0);

    void addIndexedMapping(int generatedLine, int generatedColumn, int originalLine, int originalColumn, std::string source, std::string name);

private:
    // Processed mappings, for all kinds of modifying within the sourcemap
    std::vector<std::string> _sources;
    std::vector<std::string> _sources_content;
    std::vector<std::string> _names;
    std::vector<MappingLine> _mapping_lines;
    std::unordered_map<std::string, int> _sources_index;
    std::unordered_map<std::string, int> _names_index;

    int _generated_lines = -1;
    int _segment_count = 0;
};
