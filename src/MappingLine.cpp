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

int MappingLine::lastColumn() {
    return _last_column;
}

Mapping MappingLine::findClosestMapping(int columnIndex) {
    // Ensure mappings are sorted
    sort();

    if (_segments.size() > 0) {
        Mapping searchValue = Mapping{Position{_line_number, columnIndex}, Position{-1, -1}, -1, -1};
        std::vector<Mapping>::iterator low = std::lower_bound(_segments.begin(), _segments.end(), searchValue, [](const Mapping& mappingA, const Mapping& mappingB){
            return mappingA.generated.column < mappingB.generated.column;
        });

        if (low != _segments.end()) {
            Mapping currMapping = *low;
            if (++low != _segments.end()) {
                Mapping nextMapping = *low;

                int nextMappingDiff = nextMapping.generated.column - columnIndex;
                int currMappingDiff = columnIndex - currMapping.generated.column;

                if (nextMappingDiff < currMappingDiff) {
                    return nextMapping;
                }
            }

            return currMapping;
        } else {
            return _segments.at(0);
        }
    }

    return Mapping{Position{-1, -1}, Position{-1, -1}, -1, -1};
}

void MappingLine::clearMappings() {
    this->_segments.clear();
    this->_last_column = 0;
}
