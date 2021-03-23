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
    _mapping_lines: BTreeMap<u32, MappingLine>,
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
            .entry(mapping.generated_line)
            .or_insert(MappingLine::new(mapping.generated_line));
        line.add_mapping(mapping);
    }

    pub fn write_vlq<W>(&mut self, output: &mut W) -> io::Result<()>
    where
        W: io::Write,
    {
        let mut last_line_index: u32 = 0;
        let mut previous_source: u32 = 0;
        let mut previous_original_line: u32 = 0;
        let mut previous_original_column: u32 = 0;
        let mut previous_name: u32 = 0;

        for (line_index, line_content) in &self._mapping_lines {
            let mut previous_generated_column: u32 = 0;
            let cloned_line_index = *line_index as u32;
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
                    (mapping.generated_column - previous_generated_column) as i64,
                    output,
                )?;
                previous_generated_column = mapping.generated_column;

                // Source should only be written if there is any
                match &mapping.original {
                    None => {}
                    Some(original) => {
                        vlq::encode((original.source - previous_source) as i64, output)?;
                        previous_source = original.source;

                        vlq::encode(
                            (original.original_line - previous_original_line) as i64,
                            output,
                        )?;
                        previous_original_line = original.original_line;

                        vlq::encode(
                            (original.original_column - previous_original_column) as i64,
                            output,
                        )?;
                        previous_original_column = original.original_column;
                        match original.name {
                            None => {}
                            Some(name) => {
                                vlq::encode((name - previous_name) as i64, output)?;
                                previous_name = name;
                            }
                        }
                    }
                }

                is_first_mapping = false;
            }

            last_line_index = cloned_line_index;
        }

        return Ok(());
    }

    pub fn add_vql_mappings() {}
}

#[cfg(test)]
mod tests {
    use std::str;

    #[test]
    fn basic_vlq_mappings() {
        let mut source_map = super::SourceMap::new();
        source_map.add_mapping(super::Mapping::new(
            12,
            7,
            Some(super::mapping_line::mapping::OriginalLocation::new(
                0,
                5,
                0,
                Some(0),
            )),
        ));
        source_map.add_mapping(super::Mapping::new(25, 12, None));

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
