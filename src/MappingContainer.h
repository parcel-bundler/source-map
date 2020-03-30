#include <string>
#include <vector>
#include <unordered_map>
#include "MappingLine.h"

class MappingContainer {
public:
    MappingContainer();

    ~MappingContainer();

    void addMapping(Position generated, Position original = Position{-1, -1}, int source = -1, int name = -1);

    MappingLine* addLine(int size = 0);

    void createLinesIfUndefined(int generatedLine);

    void addVLQMappings(const std::string &mappings_input, std::vector<int> &sources, std::vector<int> &names, int line_offset = 0, int column_offset = 0);

    std::string toVLQMappings();

    std::vector<std::string> &getSourcesVector();

    int addSource(std::string &source);

    int getSourceIndex(std::string &source);

    std::vector<std::string> &getNamesVector();

    int addName(std::string &name);

    int getNameIndex(std::string &name);

    int getGeneratedLines();

    int getTotalSegments();

    std::vector<MappingLine *> &getMappingLinesVector();

    void sort();

    Mapping findClosestMapping(int line, int column);

private:
    // Processed mappings, for all kinds of modifying within the sourcemap
    std::vector<std::string> _sources;
    std::vector<std::string> _names;
    std::vector<MappingLine *> _mapping_lines;
    std::unordered_map<std::string, int> _sources_index;
    std::unordered_map<std::string, int> _names_index;

    int _generated_lines = -1;
    int _segment_count = 0;
};
