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
    ++this->_segment_count;
    this->_is_sorted = false;
}

void MappingLine::sort() {
    if (!this->_is_sorted && this->_segments.size() > 1) {
        std::sort(this->_segments.begin(), this->_segments.end(), MappingGeneratedColumnComparator());
        this->_is_sorted = true;
    }
}

void MappingLine::setIsSorted(bool value) {
    this->_is_sorted = value;
}

bool MappingLine::isSorted() {
    return this->_is_sorted;
}

int MappingLine::lineNumber() {
    return this->_line_number;
}

int MappingLine::getSegmentCount() {
    return this->_segment_count;
}

