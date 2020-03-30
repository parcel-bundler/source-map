#include "Mapping.h"

Position::Position() {}
Position::Position(int line, int column) : line{line}, column{column} {

}

Mapping::Mapping() {}
Mapping::Mapping(Position generated, Position original, int source, int name) : generated{generated},
                                                                                original{original}, source{source},
                                                                                name{name} {

}

IndexedMapping::IndexedMapping() {}
IndexedMapping::IndexedMapping(Position generated, Position original, std::string source, std::string name) : 
	generated{generated}, original{original}, source{source}, name{name} {

}
