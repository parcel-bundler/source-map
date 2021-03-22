pub mod mapping_line;

use mapping_line::mapping::Mapping;
use mapping_line::MappingLine;
use std::collections::BTreeMap;

pub struct SourceMap {
    _sources: Vec<String>,
    _sources_content: Vec<String>,
    _names: Vec<String>,
    _mapping_lines: BTreeMap<i32, MappingLine>,
}

impl SourceMap {
    pub fn new() -> Self {
        Self {
            _sources: Vec::new(),
            _sources_content: Vec::new(),
            _names: Vec::new(),
            _mapping_lines: BTreeMap::new(),
        }
    }

    pub fn add_mapping(&mut self, mapping: Mapping) {
        let line = self
            ._mapping_lines
            .entry(mapping.generated.line)
            .or_insert(MappingLine::new(mapping.generated.line));
        line.add_mapping(mapping);
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
