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

    void addVLQMappings(const std::string &mappings_input, int line_offset = 0, int column_offset = 0);

    std::string toVLQMappings();

    void reserve(size_t size);

    int getSources();

    void addSources(int amount);

    int getNames();

    void addNames(int amount);

    int getGeneratedColumns();

    int getGeneratedLines();

    std::vector<Mapping> &getMappingsVector();

    std::string debugString();

private:
    void addMappingBySegment(int generatedLine, int *segment, int segmentIndex);

    // Processed mappings, for all kinds of modifying within the sourcemap
    std::vector<Mapping> _mappings;
    int _sources = 0;
    int _names = 0;

    int _generated_columns = 0;
    int _generated_lines = 0;
};
