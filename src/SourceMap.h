#include <string>
#include <vector>
#include "sourcemap-schema_generated.h"

struct Mapping {
    int generatedLine;
    int generatedColumn;
    int originalLine;
    int originalColumn;
    int source;
    int name;
};

class SourceMap {
public:
    SourceMap();

    ~SourceMap();

    void Finalize();

    void addRawMappings(const std::string &mappings_input, int sources, int names, int line_offset = 0,
                        int column_offset = 0);

    void addBufferMappings(uint8_t * bufferPointer, int line_offset = 0, int column_offset = 0);

    std::string toString();

    std::pair<uint8_t *, size_t> toBuffer();

private:
    void addMapping(int generatedLine, int *segment, int segmentIndex);

    void processRawMappings(const std::string &mappings_input, int sources, int names, int line_offset = 0,
                      int column_offset = 0);

    // Processed mappings, for all kinds of modifying within the sourcemap
    std::vector<Mapping> _mappings;
    int _sources = 0;
    int _names = 0;
};
