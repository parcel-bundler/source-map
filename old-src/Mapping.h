#include <string>

struct Position {
	Position();
    explicit Position(int line, int column);

    int line;
    int column;
};

struct Mapping {
	Mapping();
    explicit Mapping(Position generated, Position original, int source, int name);

    Position generated;
    Position original;
    int source;
    int name;
};

struct IndexedMapping {
    IndexedMapping();
    explicit IndexedMapping(Position generated, Position original, std::string source, std::string name);

    Position generated;
    Position original;
    std::string source;
    std::string name;
};
