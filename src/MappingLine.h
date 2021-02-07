#include <vector>
#include "Mapping.h"

class MappingLine {
public:
    MappingLine(int lineNumber);

    void addMapping(Mapping m);

    void clearMappings();

    void sort();

    bool isSorted();

    int lineNumber();

    int lastColumn();

    Mapping findClosestMapping(int columnIndex);

    std::vector<Mapping> _segments;

private:
    bool _is_sorted = false;
    int _line_number = 0;
    int _last_column = 0;
};