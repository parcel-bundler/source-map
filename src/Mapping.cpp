#include "Mapping.h"

Position::Position(int line, int column) : line{line}, column{column} {

}

Mapping::Mapping(Position generated, Position original, int source, int name) : generated{generated},
                                                                                original{original}, source{source},
                                                                                name{name} {

}
