pub mod mapping_line;

use mapping_line::MappingLine;

struct SourceMap {
    _sources: Vec<String>,
    _sources_content: Vec<String>,
    _names: Vec<String>,
    _mapping_lines: Vec<MappingLine>,
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
