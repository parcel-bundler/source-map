#include <vector>
#include "Mapping.h"

class MappingLine {
public:
    MappingLine(int lineNumber, int upperbound = 0);

    void addMapping(Mapping m);

    void setIsSorted(bool value);

    void sort();

    bool isSorted();

    int lineNumber();

    int segments();

    std::vector<Mapping> _segments;

private:
    bool _is_sorted = false;
    int _line_number = 0;
    int _segment_count = 0;
};