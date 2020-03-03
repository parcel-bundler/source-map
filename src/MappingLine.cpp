#include "MappingLine.h"

MappingLine::MappingLine(int lineNumber, int upperbound) {
    this->_line_number = lineNumber;
    this->reserve(upperbound);
}

void MappingLine::addMapping(Mapping m) {
    this->_segments.push_back(m);
    ++this->_segment_count;
}

void MappingLine::reserve(size_t size) {
    this->_segments.reserve(size);
}

void MappingLine::shrink_to_fit() {
    this->_segments.shrink_to_fit();
}

void MappingLine::sort() {
    // TODO: Write this...
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

int MappingLine::segments() {
    return this->_segment_count;
}

