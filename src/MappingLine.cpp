#include "MappingLine.h"
#include <algorithm>

struct MappingGeneratedColumnComparator {
    bool operator()(const Mapping &m1, const Mapping &m2) {
        return m1.generated.column < m2.generated.column;
    }
};

MappingLine::MappingLine(int lineNumber, int upperbound) : _line_number{lineNumber} {
    this->_segments.reserve(upperbound);
}

void MappingLine::addMapping(Mapping m) {
    this->_segments.push_back(m);

    if (this->_is_sorted && this->_last_column > m.generated.column) {
        this->_is_sorted = false;
    }

    this->_last_column = m.generated.column;
}

void MappingLine::sort() {
    if (!this->_is_sorted && this->_segments.size() > 1) {
        std::sort(this->_segments.begin(), this->_segments.end(), MappingGeneratedColumnComparator());
        this->_is_sorted = true;
    }
}

bool MappingLine::isSorted() {
    return this->_is_sorted;
}

int MappingLine::lineNumber() {
    return this->_line_number;
}

