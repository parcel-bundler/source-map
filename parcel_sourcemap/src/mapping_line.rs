use std::collections::BTreeMap;

pub mod mapping;

use mapping::Mapping;

pub struct MappingLine {
    pub mappings: BTreeMap<i32, Mapping>,
    pub line_number: i32,
}

impl MappingLine {
    pub fn new(line_number: i32) -> Self {
        Self {
            line_number,
            mappings: BTreeMap::new(),
        }
    }

    pub fn add_mapping(&mut self, mapping: Mapping) {
        // This should insert or overwrite the value at this key, hopefully it works...
        self.mappings.insert(mapping.generated.column, mapping);
    }
}
