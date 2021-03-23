pub struct OriginalLocation {
    pub original_line: u32,
    pub original_column: u32,
    pub source: u32,
    pub name: Option<u32>,
}

impl OriginalLocation {
    pub fn new(original_line: u32, original_column: u32, source: u32, name: Option<u32>) -> Self {
        Self {
            original_line,
            original_column,
            source,
            name,
        }
    }
}

pub struct Mapping {
    pub generated_line: u32,
    pub generated_column: u32,
    pub original: Option<OriginalLocation>,
}

impl Mapping {
    pub fn new(
        generated_line: u32,
        generated_column: u32,
        original: Option<OriginalLocation>,
    ) -> Self {
        Self {
            generated_line,
            generated_column,
            original,
        }
    }
}
