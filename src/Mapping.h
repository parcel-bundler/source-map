struct Position {
    explicit Position(int line, int column);

    int line;
    int column;
};

struct Mapping {
    explicit Mapping(Position generated, Position original, int source, int name);

    Position generated;
    Position original;
    int source;
    int name;
};
