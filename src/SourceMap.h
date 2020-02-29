#include <string>
#include <vector>

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

    void fromString(const std::string& map);

private:
    void addMapping(int generatedLine, int *segment, int segmentIndex);

    std::vector<Mapping> _mappings;
};
