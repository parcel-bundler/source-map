pub mod mapping;
pub mod mapping_line;
pub mod sourcemap_error;
mod vlq_utils;

use mapping::{Mapping, OriginalLocation};
use mapping_line::MappingLine;
use sourcemap_error::{SourceMapError, SourceMapErrorType};
use std::collections::BTreeMap;
use std::io;
use vlq;
use vlq_utils::{is_mapping_separator, read_relative_vlq};

pub struct SourceMap {
    pub sources: Vec<String>,
    pub sources_content: Vec<String>,
    pub names: Vec<String>,
    pub mapping_lines: BTreeMap<u32, MappingLine>,
}

impl SourceMap {
    pub fn new() -> Self {
        Self {
            sources: Vec::new(),
            sources_content: Vec::new(),
            names: Vec::new(),
            mapping_lines: BTreeMap::new(),
        }
    }

    pub fn add_mapping(&mut self, mapping: Mapping) {
        let line = self
            .mapping_lines
            .entry(mapping.generated_line)
            .or_insert(MappingLine::new(mapping.generated_line));
        line.add_mapping(mapping);
    }

    pub fn write_vlq<W>(&mut self, output: &mut W) -> Result<(), SourceMapError>
    where
        W: io::Write,
    {
        let mut last_line_index: u32 = 0;
        let mut previous_source: u32 = 0;
        let mut previous_original_line: u32 = 0;
        let mut previous_original_column: u32 = 0;
        let mut previous_name: u32 = 0;

        for (line_index, line_content) in &self.mapping_lines {
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

    pub fn add_source(&mut self, source: String) -> u32 {
        return match self.sources.iter().position(|s| source.eq(s)) {
            Some(i) => i as u32,
            None => {
                self.sources.push(source);
                (self.sources.len() - 1) as u32
            }
        };
    }

    pub fn add_sources(&mut self, sources: Vec<String>) -> Vec<u32> {
        return sources
            .iter()
            .map(|s| self.add_source(s.to_string()))
            .collect();
    }

    pub fn add_name(&mut self, name: String) -> u32 {
        return match self.names.iter().position(|s| name.eq(s)) {
            Some(i) => i as u32,
            None => {
                self.names.push(name);
                (self.names.len() - 1) as u32
            }
        };
    }

    pub fn add_names(&mut self, names: Vec<String>) -> Vec<u32> {
        return names
            .iter()
            .map(|n| self.add_name(n.to_string()))
            .collect();
    }

    pub fn add_vql_mappings(
        &mut self,
        input: &[u8],
        sources: Vec<String>,
        names: Vec<String>,
    ) -> Result<(), SourceMapError> {
        let mut generated_line = 0;
        let mut generated_column = 0;
        let mut original_line = 0;
        let mut original_column = 0;
        let mut source = 0;
        let mut name = 0;

        let source_indexes: Vec<u32> = self.add_sources(sources);
        let name_indexes: Vec<u32> = self.add_names(names);

        let mut input = input.iter().cloned().peekable();
        while let Some(byte) = input.peek().cloned() {
            match byte {
                b';' => {
                    generated_line += 1;
                    generated_column = 0;
                    input.next().unwrap();
                }
                b',' => {
                    input.next().unwrap();
                }
                _ => {
                    // First is a generated column that is always present.
                    read_relative_vlq(&mut generated_column, &mut input)?;

                    // Read source, original line, and original column if the
                    // mapping has them.
                    let original = if input.peek().cloned().map_or(true, is_mapping_separator) {
                        None
                    } else {
                        read_relative_vlq(&mut source, &mut input)?;
                        read_relative_vlq(&mut original_line, &mut input)?;
                        read_relative_vlq(&mut original_column, &mut input)?;
                        Some(OriginalLocation::new(
                            original_line,
                            original_column,
                            match source_indexes.get(source as usize) {
                                Some(v) => *v,
                                None => {
                                    return Err(SourceMapError::new(
                                        SourceMapErrorType::SourceOutOfRange,
                                        None,
                                    ));
                                }
                            },
                            if input.peek().cloned().map_or(true, is_mapping_separator) {
                                None
                            } else {
                                read_relative_vlq(&mut name, &mut input)?;
                                Some(match name_indexes.get(name as usize) {
                                    Some(v) => *v,
                                    None => {
                                        return Err(SourceMapError::new(
                                            SourceMapErrorType::NameOutOfRange,
                                            None,
                                        ));
                                    }
                                })
                            },
                        ))
                    };

                    self.add_mapping(Mapping::new(generated_line, generated_column, original));
                }
            }
        }

        return Ok(());
    }
}

#[cfg(test)]
mod tests {
    use std::str;

    #[test]
    fn write_vlq_mappings() {
        let mut source_map = super::SourceMap::new();
        source_map.add_mapping(super::Mapping::new(
            12,
            7,
            Some(super::mapping::OriginalLocation::new(0, 5, 0, Some(0))),
        ));
        source_map.add_mapping(super::Mapping::new(25, 12, None));
        source_map.add_mapping(super::Mapping::new(
            15,
            9,
            Some(super::mapping::OriginalLocation::new(0, 5, 1, Some(0))),
        ));

        let mut output = vec![];
        match source_map.write_vlq(&mut output) {
            Ok(()) => {
                let vlq_string = str::from_utf8(&output).unwrap();
                assert_eq!(vlq_string, ";;;;;;;;;;;;OAAKA;;;SCAAA;;;;;;;;;;Y");
            }
            Err(err) => {
                panic!(err);
            }
        };
    }

    #[test]
    fn read_vlq_mappings() {
        let vlq_mappings = b";;;;;;;;;;;;OAAKA;;;SCAAA;;;;;;;;;;Y";
        let sources = vec![String::from("a.js"), String::from("b.js")];
        let names = vec![String::from("test")];
        let mut source_map = super::SourceMap::new();

        match source_map.add_vql_mappings(vlq_mappings, sources, names) {
            Ok(()) => {}
            Err(err) => panic!(err),
        }

        // Should be able to write the vlq mappings again...
        let mut output = vec![];
        match source_map.write_vlq(&mut output) {
            Ok(()) => {
                let vlq_string = str::from_utf8(&output).unwrap();
                assert_eq!(vlq_string, ";;;;;;;;;;;;OAAKA;;;SCAAA;;;;;;;;;;Y");
            }
            Err(err) => {
                panic!(err);
            }
        };
    }
}
