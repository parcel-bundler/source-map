use crate::mapping::{OriginalLocation};
use std::collections::BTreeMap;

pub struct MappingLine {
    pub mappings: BTreeMap<u32, Option<OriginalLocation>>,
    pub line_number: u32,
}

impl MappingLine {
    pub fn new(line_number: u32) -> Self {
        Self {
            line_number,
            mappings: BTreeMap::new(),
        }
    }

    pub fn add_mapping(&mut self, generated_column: u32, original: Option<OriginalLocation>) {
        // This should insert or overwrite the value at this key, hopefully it works...
        self.mappings.insert(generated_column, original);
    }
}
