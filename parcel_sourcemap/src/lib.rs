extern crate flatbuffers;

pub mod mapping;
pub mod mapping_line;
pub mod sourcemap_error;
mod vlq_utils;

use flatbuffers::FlatBufferBuilder;
use mapping::{Mapping, OriginalLocation};
use mapping_line::MappingLine;
use sourcemap_error::{SourceMapError, SourceMapErrorType};
use std::collections::BTreeMap;
use std::io;
use vlq;
use vlq_utils::{is_mapping_separator, read_relative_vlq};

// import the generated code
#[allow(dead_code, unused_imports)]
#[path = "./schema_generated.rs"]
mod schema_generated;
pub use schema_generated::source_map_schema;

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

    // TODO: Validate if source and name exist?
    pub fn add_mapping(&mut self, mapping: Mapping) {
        let line = self
            .mapping_lines
            .entry(mapping.generated_line)
            .or_insert(MappingLine::new(mapping.generated_line));
        line.add_mapping(mapping.generated_column, mapping.original);
    }

    pub fn find_closest_mapping(
        &self,
        generated_line: u32,
        generated_column: u32,
    ) -> Option<Mapping> {
        match self.mapping_lines.get(&generated_line) {
            Some(line) => match line.mappings.range(..generated_column).next_back() {
                Some((column_number, original)) => {
                    return Some(Mapping::new(generated_line, *column_number, *original));
                }
                None => {
                    return None;
                }
            },
            None => {
                return None;
            }
        }
    }

    pub fn write_vlq<W>(&self, output: &mut W) -> Result<(), SourceMapError>
    where
        W: io::Write,
    {
        let mut last_generated_line: u32 = 0;
        let mut previous_source: u32 = 0;
        let mut previous_original_line: u32 = 0;
        let mut previous_original_column: u32 = 0;
        let mut previous_name: u32 = 0;

        for (generated_line, line_content) in &self.mapping_lines {
            let mut previous_generated_column: u32 = 0;
            let cloned_generated_line = *generated_line as u32;
            if cloned_generated_line > 0 {
                // Write a ';' for each line between this and last line, way more efficient than storing empty lines or looping...
                output
                    .write(&b";".repeat((cloned_generated_line - last_generated_line) as usize))?;
            }

            let mut is_first_mapping: bool = true;
            for (generated_column, original_location_option) in &line_content.mappings {
                if !is_first_mapping {
                    output.write(b",")?;
                }

                vlq::encode(
                    (generated_column - previous_generated_column) as i64,
                    output,
                )?;
                previous_generated_column = *generated_column;

                // Source should only be written if there is any
                if let Some(original) = &original_location_option {
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
                    if let Some(name) = original.name {
                        vlq::encode((name - previous_name) as i64, output)?;
                        previous_name = name;
                    }
                }

                is_first_mapping = false;
            }

            last_generated_line = cloned_generated_line;
        }

        return Ok(());
    }

    pub fn add_source(&mut self, source: &str) -> u32 {
        return match self.sources.iter().position(|s| source.eq(s)) {
            Some(i) => i as u32,
            None => {
                self.sources.push(String::from(source));
                (self.sources.len() - 1) as u32
            }
        };
    }

    pub fn add_sources(&mut self, sources: Vec<&str>) -> Vec<u32> {
        self.sources.reserve(sources.len());
        return sources.iter().map(|s| self.add_source(s)).collect();
    }

    pub fn add_name(&mut self, name: &str) -> u32 {
        return match self.names.iter().position(|s| name.eq(s)) {
            Some(i) => i as u32,
            None => {
                self.names.push(String::from(name));
                (self.names.len() - 1) as u32
            }
        };
    }

    pub fn add_names(&mut self, names: Vec<&str>) -> Vec<u32> {
        self.names.reserve(names.len());
        return names.iter().map(|n| self.add_name(n)).collect();
    }

    pub fn set_source_content(
        &mut self,
        source_index: usize,
        source_content: &str,
    ) -> Result<(), SourceMapError> {
        if self.sources.len() == 0 || source_index > self.sources.len() - 1 {
            return Err(SourceMapError::new(
                SourceMapErrorType::SourceOutOfRange,
                None,
            ));
        }

        let sources_content_len = self.sources_content.len();
        if sources_content_len > source_index + 1 {
            self.sources_content[source_index] = String::from(source_content);
        } else {
            self.sources_content
                .reserve(sources_content_len - source_index + 1);
            let items_to_add = source_index + 1 - sources_content_len;
            for _n in 0..items_to_add {
                self.sources_content.push(String::from(""));
            }
            self.sources_content.push(String::from(source_content));
        }
        return Ok(());
    }

    pub fn write_to_buffer(&self, output: &mut Vec<u8>) -> Result<(), SourceMapError> {
        output.clear();

        let mut builder = FlatBufferBuilder::new_with_capacity(2048);

        let names_vec: Vec<&str> = self.names.iter().map(|n| &n[..]).collect();
        let names_buffer_vec = builder.create_vector_of_strings(&names_vec[..]);

        let sources_vec: Vec<&str> = self.sources.iter().map(|n| &n[..]).collect();
        let sources_buffer_vec = builder.create_vector_of_strings(&sources_vec[..]);

        let sources_content_vec: Vec<&str> = self.sources_content.iter().map(|n| &n[..]).collect();
        let sources_content_buffer_vec = builder.create_vector_of_strings(&sources_content_vec[..]);

        // TODO: Refactor to iterators?
        let mut mappings_vec: Vec<source_map_schema::Mapping> = Vec::new();
        for (generated_line, line) in self.mapping_lines.iter() {
            mappings_vec.reserve(line.mappings.len());
            for (generated_column, original_location_value) in line.mappings.iter() {
                let mut original_line: i32 = -1;
                let mut original_column: i32 = -1;
                let mut original_source: i32 = -1;
                let mut original_name: i32 = -1;

                if let Some(original_location) = original_location_value {
                    original_line = original_location.original_line as i32;
                    original_column = original_location.original_column as i32;
                    original_source = original_location.source as i32;

                    if let Some(name) = original_location.name {
                        original_name = name as i32;
                    }
                }

                mappings_vec.push(source_map_schema::Mapping::new(
                    *generated_line,
                    *generated_column,
                    original_line,
                    original_column,
                    original_source,
                    original_name,
                ));
            }
        }

        let mappings_vec = builder.create_vector_from_iter(mappings_vec.iter());

        let args = source_map_schema::MapArgs {
            mappings: Some(mappings_vec),
            names: Some(names_buffer_vec),
            sources: Some(sources_buffer_vec),
            sources_content: Some(sources_content_buffer_vec),
        };

        let root = source_map_schema::Map::create(&mut builder, &args);

        source_map_schema::finish_map_buffer(&mut builder, root);

        // Copy the serialized FlatBuffers data to our own byte buffer.
        let finished_data = builder.finished_data();
        output.extend_from_slice(finished_data);

        // Return
        return Ok(());
    }

    pub fn add_buffer_mappings(&mut self, buf: &[u8]) -> Result<(), SourceMapError> {
        let buffer_map = source_map_schema::root_as_map(buf)?;

        let mut name_indexes: Vec<u32> = Vec::new();
        if let Some(names_buffer) = buffer_map.names() {
            self.names.reserve(names_buffer.len());
            for name_str in names_buffer {
                name_indexes.push(self.add_name(name_str));
            }
        }

        let mut source_indexes: Vec<u32> = Vec::new();
        if let Some(sources_buffer) = buffer_map.sources() {
            self.sources.reserve(sources_buffer.len());
            for source_str in sources_buffer {
                source_indexes.push(self.add_source(source_str));
            }
        }

        if let Some(sources_content_buffer) = buffer_map.sources() {
            self.sources_content.reserve(sources_content_buffer.len());
            for (i, source_content_str) in sources_content_buffer.iter().enumerate() {
                if let Some(source_index) = source_indexes.get(i) {
                    self.set_source_content(*source_index as usize, source_content_str)?;
                }
            }
        }

        if let Some(buffer_mappings) = buffer_map.mappings() {
            for buffer_mapping in buffer_mappings {
                let original_line = buffer_mapping.original_line();
                let original_column = buffer_mapping.original_column();
                let source = buffer_mapping.source();
                let mut original_location = None;
                if original_line > -1 && original_column > -1 && source > -1 {
                    if let Some(real_source) = source_indexes.get(source as usize) {
                        let name = buffer_mapping.name();
                        let mut real_name: Option<u32> = None;
                        if name > -1 {
                            if let Some(found_name) = name_indexes.get(source as usize) {
                                real_name = Some(*found_name);
                            }
                        }

                        original_location = Some(OriginalLocation::new(
                            original_line as u32,
                            original_column as u32,
                            *real_source,
                            real_name,
                        ));
                    }
                }

                self.add_mapping(Mapping::new(
                    buffer_mapping.generated_line(),
                    buffer_mapping.generated_column(),
                    original_location,
                ))
            }
        }

        return Ok(());
    }

    pub fn add_vql_mappings(
        &mut self,
        input: &[u8],
        sources: Vec<&str>,
        names: Vec<&str>,
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

    pub fn offset_columns(
        &mut self,
        generated_line: u32,
        generated_column: u32,
        generated_column_offset: i64,
    ) -> Result<(), SourceMapError> {
        match self.mapping_lines.get_mut(&generated_line) {
            Some(line) => {
                return line.offset_columns(generated_column, generated_column_offset);
            }
            None => {
                return Ok(());
            }
        }
    }

    pub fn offset_lines(
        &mut self,
        generated_line: u32,
        generated_line_offset: i64,
    ) -> Result<(), SourceMapError> {
        let (start_line, overflowed) =
            (generated_line as i64).overflowing_add(generated_line_offset);
        if overflowed || start_line > (u32::MAX as i64) {
            return Err(SourceMapError::new(
                SourceMapErrorType::UnexpectedNegativeNumber,
                Some(String::from("column + column_offset cannot be negative")),
            ));
        }

        let part_to_remap = self.mapping_lines.split_off(&generated_line);

        // Remove mappings that are within the range that'll get replaced
        let u_start_line = start_line as u32;
        self.mapping_lines.split_off(&u_start_line);

        // re-add remapped mappings
        let abs_offset = generated_line_offset.abs() as u32;
        for (key, value) in part_to_remap {
            self.mapping_lines.insert(
                if generated_line_offset < 0 {
                    key - abs_offset
                } else {
                    key + abs_offset
                },
                value,
            );
        }

        return Ok(());
    }
}

#[cfg(test)]
mod tests {
    use std::str;
    use std::time::Instant;

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

        // Basic find closest test
        match source_map.find_closest_mapping(12, 10) {
            Some(mapping) => {
                assert_eq!(mapping.generated_line, 12);
                assert_eq!(mapping.generated_column, 7);
                match mapping.original {
                    Some(original) => {
                        assert_eq!(original.original_line, 0);
                        assert_eq!(original.original_column, 5);
                        assert_eq!(original.source, 0);
                        match original.name {
                            Some(name) => {
                                assert_eq!(name, 0);
                            }
                            None => {
                                panic!("No name attached to mapping")
                            }
                        }
                    }
                    None => {
                        panic!("No original position attached to mapping")
                    }
                }
            }
            None => {
                panic!("Mapping not found");
            }
        }
    }

    #[test]
    fn read_vlq_mappings() {
        let vlq_mappings = b";;;;;;;;;;;;OAAKA;;;SCAAA;;;;;;;;;;Y";
        let sources = vec!["a.js", "b.js"];
        let names = vec!["test"];
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

    #[test]
    fn offset_columns() {
        let mut source_map_one = super::SourceMap::new();
        source_map_one.add_mapping(super::Mapping::new(
            12,
            7,
            Some(super::mapping::OriginalLocation::new(0, 5, 0, Some(0))),
        ));
        source_map_one.add_mapping(super::Mapping::new(
            15,
            9,
            Some(super::mapping::OriginalLocation::new(0, 5, 1, Some(0))),
        ));
        source_map_one.add_mapping(super::Mapping::new(12, 2, None));
        source_map_one.add_mapping(super::Mapping::new(
            12,
            15,
            Some(super::mapping::OriginalLocation::new(0, 5, 0, Some(0))),
        ));
        source_map_one.add_mapping(super::Mapping::new(12, 43, None));

        match source_map_one.offset_columns(12, 14, -9) {
            Ok(_) => {}
            Err(err) => panic!(err),
        }

        let mut source_map_two = super::SourceMap::new();
        source_map_two.add_mapping(super::Mapping::new(12, 2, None));
        source_map_two.add_mapping(super::Mapping::new(
            12,
            6,
            Some(super::mapping::OriginalLocation::new(0, 5, 0, Some(0))),
        ));
        source_map_two.add_mapping(super::Mapping::new(12, 34, None));
        source_map_two.add_mapping(super::Mapping::new(
            15,
            9,
            Some(super::mapping::OriginalLocation::new(0, 5, 1, Some(0))),
        ));

        let mut output_one = vec![];
        match source_map_one.write_vlq(&mut output_one) {
            Ok(()) => {
                let mut output_two = vec![];
                match source_map_two.write_vlq(&mut output_two) {
                    Ok(()) => {
                        let string_one = str::from_utf8(&output_one).unwrap();
                        let string_two = str::from_utf8(&output_two).unwrap();
                        assert_eq!(string_one, string_two);
                    }
                    Err(err) => {
                        panic!(err);
                    }
                };
            }
            Err(err) => {
                panic!(err);
            }
        };
    }

    #[test]
    fn offset_benchmark() {
        let start_time = Instant::now();
        let mut source_map = super::SourceMap::new();

        // Based on amount of mappings in kitchen-sink example
        for mapping_id in 1..25000 {
            source_map.add_mapping(super::Mapping::new(1, mapping_id, None));
        }

        match source_map.offset_columns(1, 500, -251) {
            Ok(_) => {}
            Err(err) => {
                panic!(err)
            }
        }

        let elapsed = start_time.elapsed().as_millis();
        println!("Offset mappings duration: {}ms", elapsed);
    }

    #[test]
    fn find_benchmark() {
        let start_time = Instant::now();
        let mut source_map = super::SourceMap::new();

        // Based on amount of mappings in kitchen-sink example
        for mapping_index in 1..25000 {
            source_map.add_mapping(super::Mapping::new(1, mapping_index, None));
        }

        source_map.find_closest_mapping(1, 25000);

        let elapsed = start_time.elapsed().as_millis();
        println!("Find closest mapping duration: {}ms", elapsed);
    }

    #[test]
    fn flatbuffers() {
        let start_time = Instant::now();

        let mut original_source_map = super::SourceMap::new();
        original_source_map.add_source("a.js");
        original_source_map.add_source("b.js");
        original_source_map.add_name("test");
        original_source_map.add_mapping(super::Mapping::new(
            12,
            7,
            Some(super::mapping::OriginalLocation::new(0, 5, 0, Some(0))),
        ));
        original_source_map.add_mapping(super::Mapping::new(25, 12, None));
        original_source_map.add_mapping(super::Mapping::new(
            15,
            9,
            Some(super::mapping::OriginalLocation::new(0, 5, 1, Some(0))),
        ));

        let mut buffer = Vec::new();
        match original_source_map.write_to_buffer(&mut buffer) {
            Ok(()) => (),
            Err(err) => panic!(err),
        }

        let mut new_map = super::SourceMap::new();
        match new_map.add_buffer_mappings(&buffer) {
            Ok(()) => (),
            Err(err) => panic!(err),
        }

        // Basic find closest test
        match new_map.find_closest_mapping(12, 10) {
            Some(mapping) => {
                assert_eq!(mapping.generated_line, 12);
                assert_eq!(mapping.generated_column, 7);
                match mapping.original {
                    Some(original) => {
                        assert_eq!(original.original_line, 0);
                        assert_eq!(original.original_column, 5);
                        assert_eq!(original.source, 0);
                        match original.name {
                            Some(name) => {
                                assert_eq!(name, 0);
                            }
                            None => {
                                panic!("No name attached to mapping")
                            }
                        }
                    }
                    None => {
                        panic!("No original position attached to mapping")
                    }
                }
            }
            None => {
                panic!("Mapping not found");
            }
        }

        let elapsed = start_time.elapsed().as_millis();
        println!("Flatbuffer test duration: {}ms", elapsed);
    }
}
