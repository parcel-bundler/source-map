#include "MappingLine.h"
#include <algorithm>

struct MappingGeneratedColumnComparator {
    bool operator()(const Mapping &m1, const Mapping &m2) {
        return m1.generated.column < m2.generated.column;
    }
};

MappingLine::MappingLine(int lineNumber) : _line_number{lineNumber} {}

void MappingLine::addMapping(Mapping m) {
    _segments.push_back(m);

    if (_is_sorted && _last_column > m.generated.column) {
        _is_sorted = false;
    }

    _last_column = m.generated.column;
}

void MappingLine::sort() {
    if (!_is_sorted && _segments.size() > 1) {
        std::sort(_segments.begin(), _segments.end(), MappingGeneratedColumnComparator());
        _is_sorted = true;
    }
}

bool MappingLine::isSorted() {
    return _is_sorted;
}

int MappingLine::lineNumber() {
    return _line_number;
}

