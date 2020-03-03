struct Position {
    int line;
    int column;
};

struct Mapping {
    Position generated;
    Position original;
    int source;
    int name;
};
