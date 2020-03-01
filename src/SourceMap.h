#include <string>
#include <vector>

#define VLQ_BASE_SHIFT 5
#define VLQ_BASE (1 << VLQ_BASE_SHIFT)
#define VLQ_BASE_MASK (VLQ_BASE - 1)
#define VLQ_CONTINUATION_BIT VLQ_BASE

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

    void addMappings(const std::string &mappings_input, int sources, int names, int line_offset = 0,
                     int column_offset = 0);

    std::string toString();

private:
    void addMapping(int generatedLine, int *segment, int segmentIndex);

    void readMappings(const std::string &mappings_input, int sources, int names, int line_offset = 0,
                      int column_offset = 0);

    void readRawMappings();

    void encodeVlq(int i, std::ostream &os);

    // Raw mappings data, used in case no modifications are done
    // This makes sourcemap generation about 10x faster if no changes are needed...
    std::string _raw_mappings;
    int _raw_sources = 0;
    int _raw_names = 0;

    // Processed mappings, for all kinds of modifying within the sourcemap
    std::vector<Mapping> _parsed_mappings;
    int _parsed_sources = 0;
    int _parsed_names = 0;
};
