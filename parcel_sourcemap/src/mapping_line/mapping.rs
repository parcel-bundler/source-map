pub struct Position {
    pub line: i32,
    pub column: i32,
}

impl Position {
    pub fn new(line: i32, column: i32) -> Self {
        Self { line, column }
    }
}

pub struct Mapping {
    pub original: Position,
    pub generated: Position,
    pub source: i32,
    pub name: i32,
}

impl Mapping {
    pub fn new(generated: Position, original: Position, source: i32, name: i32) -> Self {
        Self {
            original,
            generated,
            source,
            name,
        }
    }
}
