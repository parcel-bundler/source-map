use std::collections::BTreeMap;

pub mod mapping;

use mapping::Mapping;

pub struct MappingLine {
    _mappings: BTreeMap<i32, Mapping>,
    pub line_number: i32,
}

impl MappingLine {
    pub fn new(line_number: i32) -> Self {
        Self {
            line_number,
            _mappings: BTreeMap::new(),
        }
    }

    pub fn add_mapping(&mut self, mapping: Mapping) {
        self._mappings.insert(mapping.generated.column, mapping);
    }
}
