pub mod mapping_line;

use mapping_line::mapping::Mapping;
use mapping_line::MappingLine;
use std::collections::BTreeMap;
use std::io;
use vlq;

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

    pub fn write_vlq<W>(&mut self, output: &mut W) -> io::Result<()>
    where
        W: io::Write,
    {
        let mut last_line_index: i32 = 0;
        let mut previous_source: i32 = 0;
        let mut previous_original_line: i32 = 0;
        let mut previous_original_column: i32 = 0;
        let mut previous_name: i32 = 0;
        for (line_index, line_content) in &self._mapping_lines {
            let mut previous_generated_column: i32 = 0;
            let cloned_line_index = *line_index;
            if cloned_line_index > 0 {
                // Write a ';' for each line between this and last line, way more efficient than storing empty lines or looping...
                output.write(&b";".repeat((cloned_line_index - last_line_index) as usize))?;
            }

            let mut is_first_mapping: bool = true;
            for (_mapping_index, mapping) in &line_content.mappings {
                if !is_first_mapping {
                    output.write(b",")?;
                }

                vlq::encode(
                    (mapping.generated.column - previous_generated_column) as i64,
                    output,
                )?;
                previous_generated_column = mapping.generated.column;

                // Source should only be written if there is any
                if mapping.source > -1 {
                    vlq::encode((mapping.source - previous_source) as i64, output)?;
                    previous_source = mapping.source;

                    vlq::encode(
                        (mapping.original.line - previous_original_line) as i64,
                        output,
                    )?;
                    previous_original_line = mapping.original.line;

                    vlq::encode(
                        (mapping.original.column - previous_original_column) as i64,
                        output,
                    )?;
                    previous_original_column = mapping.original.column;

                    // Name should not be written if there's no original location (I think?)
                    if mapping.name > -1 {
                        vlq::encode((mapping.name - previous_name) as i64, output)?;
                        previous_name = mapping.name;
                    }
                }

                is_first_mapping = false;
            }

            last_line_index = cloned_line_index;
        }

        return Ok(());
    }
}

#[cfg(test)]
mod tests {
    use std::str;

    #[test]
    fn basic_vlq_mappings() {
        let mut source_map = super::SourceMap::new();
        source_map.add_mapping(super::Mapping::new(
            super::mapping_line::mapping::Position::new(12, 7),
            super::mapping_line::mapping::Position::new(0, 5),
            0,
            0,
        ));
        source_map.add_mapping(super::Mapping::new(
            super::mapping_line::mapping::Position::new(25, 12),
            super::mapping_line::mapping::Position::new(-1, -1),
            -1,
            -1,
        ));

        let mut output = vec![];
        match source_map.write_vlq(&mut output) {
            Ok(()) => {
                let vlq_string = str::from_utf8(&output).unwrap();
                assert_eq!(vlq_string, ";;;;;;;;;;;;OAAKA;;;;;;;;;;;;;Y");
            }
            Err(err) => {
                panic!(err);
            }
        };
    }
}
