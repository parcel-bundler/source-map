#include <string>
#include <vector>
#include "MappingLine.h"

class MappingContainer {
public:
    MappingContainer();

    ~MappingContainer();

    void Finalize();

    void addMapping(Position generated, Position original = Position{-1, -1}, int source = -1, int name = -1);

    MappingLine* addLine(int size = 0);

    void createLinesIfUndefined(int generatedLine);

    void addVLQMappings(const std::string &mappings_input, int line_offset = 0, int column_offset = 0,
                        int sources_offset = 0, int names_offset = 0);

    std::string toVLQMappings();

    std::vector<std::string> &getSourcesVector();

    int getSourcesCount();

    int addSource(std::string source);

    std::vector<std::string> &getNamesVector();

    int getNamesCount();

    int addName(std::string name);

    int getGeneratedColumns();

    int getGeneratedLines();

    int getTotalSegments();

    std::vector<MappingLine *> &getMappingLinesVector();

    void sort();

    int segments();

    std::string debugString();

private:
    void _addMappingBySegment(int generatedLine, int *segment, int segmentIndex);

    // Processed mappings, for all kinds of modifying within the sourcemap
    std::vector<std::string> _sources;
    std::vector<std::string> _names;
    std::vector<MappingLine *> _mapping_lines;

    int _generated_columns = 0;
    int _generated_lines = -1;
    int _segment_count = 0;
};
