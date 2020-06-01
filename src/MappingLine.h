#include <vector>
#include "Mapping.h"

class MappingLine {
public:
    MappingLine(int lineNumber);

    void addMapping(Mapping m);

    void sort();

    bool isSorted();

    int lineNumber();

    std::vector<Mapping> _segments;

private:
    bool _is_sorted = false;
    int _line_number = 0;
    int _last_column = 0;
};