use crate::mapping::Mapping;
use std::collections::BTreeMap;

pub struct MappingLine {
    pub mappings: BTreeMap<u32, Mapping>,
    pub line_number: u32,
}

impl MappingLine {
    pub fn new(line_number: u32) -> Self {
        Self {
            line_number,
            mappings: BTreeMap::new(),
        }
    }

    pub fn add_mapping(&mut self, mapping: Mapping) {
        // This should insert or overwrite the value at this key, hopefully it works...
        self.mappings.insert(mapping.generated_column, mapping);
    }
}
