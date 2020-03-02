#include <string>
#include <vector>

struct Position {
    int line;
    int column;
};

struct Mapping {
    Position generated;
    Position original;
    int source;
    int name;
};

class MappingContainer {
public:
    MappingContainer();

    ~MappingContainer();

    void Finalize();

    void addMapping(Position generated, Position original = {-1, -1}, int source = -1, int name = -1);

    void addVLQMappings(const std::string &mappings_input, int line_offset = 0, int column_offset = 0, int sources_offset = 0, int names_offset = 0);

    std::string toVLQMappings();

    void reserve(size_t size);

    std::vector<std::string> &getSourcesVector();

    int getSourcesCount();

    int addSource(std::string source);

    std::vector<std::string> &getNamesVector();

    int getNamesCount();

    int addName(std::string name);

    int getGeneratedColumns();

    int getGeneratedLines();

    std::vector<Mapping> &getMappingsVector();

    std::string debugString();

private:
    void addMappingBySegment(int generatedLine, int *segment, int segmentIndex);

    // Processed mappings, for all kinds of modifying within the sourcemap
    std::vector<Mapping> _mappings;
    std::vector<std::string> _sources;
    std::vector<std::string> _names;

    int _generated_columns = 0;
    int _generated_lines = 0;
};
