extern crate flatbuffers;

pub mod mapping;
pub mod mapping_line;
pub mod sourcemap_error;
pub mod utils;
mod vlq_utils;

use crate::utils::relatify_path;
use flatbuffers::FlatBufferBuilder;
pub use mapping::{Mapping, OriginalLocation};
use mapping_line::MappingLine;
pub use sourcemap_error::{SourceMapError, SourceMapErrorType};
use std::collections::BTreeMap;
use std::io;
use vlq;
use vlq_utils::{is_mapping_separator, read_relative_vlq};

// import the generated code
#[allow(dead_code, unused_imports)]
#[path = "./schema_generated.rs"]
mod schema_generated;
use schema_generated::source_map_schema;

pub struct SourceMap {
    pub project_root: String,
    pub sources: Vec<String>,
    pub sources_content: Vec<String>,
    pub names: Vec<String>,
    pub mapping_lines: BTreeMap<u32, MappingLine>,
}

impl SourceMap {
    pub fn new(project_root: &str) -> Self {
        Self {
            project_root: String::from(project_root),
            sources: Vec::new(),
            sources_content: Vec::new(),
            names: Vec::new(),
            mapping_lines: BTreeMap::new(),
        }
    }

    pub fn add_mapping(
        &mut self,
        generated_line: u32,
        generated_column: u32,
        original: Option<OriginalLocation>,
    ) {
        // TODO: Create new public function that validates if source and name exist?
        let line = self
            .mapping_lines
            .entry(generated_line)
            .or_insert(MappingLine::new(generated_line));
        line.add_mapping(generated_column, original);
    }

    pub fn add_mapping_with_offset(
        &mut self,
        mapping: Mapping,
        line_offset: i64,
        column_offset: i64,
    ) -> Result<(), SourceMapError> {
        let (generated_line, generated_line_overflowed) =
            (mapping.generated_line as i64).overflowing_add(line_offset);
        if generated_line_overflowed || generated_line > (u32::MAX as i64) {
            return Err(SourceMapError::new_with_reason(
                SourceMapErrorType::UnexpectedlyBigNumber,
                "mapping.generated_line + line_offset",
            ));
        }

        if generated_line < 0 {
            return Err(SourceMapError::new_with_reason(
                SourceMapErrorType::UnexpectedNegativeNumber,
                "mapping.generated_line + line_offset",
            ));
        }

        let (generated_column, generated_column_overflowed) =
            (mapping.generated_column as i64).overflowing_add(column_offset);
        if generated_column_overflowed || generated_column > (u32::MAX as i64) {
            return Err(SourceMapError::new_with_reason(
                SourceMapErrorType::UnexpectedlyBigNumber,
                "mapping.generated_column + column_offset",
            ));
        }

        if generated_column < 0 {
            return Err(SourceMapError::new_with_reason(
                SourceMapErrorType::UnexpectedNegativeNumber,
                "mapping.generated_column + column_offset",
            ));
        }

        self.add_mapping(
            generated_line as u32,
            generated_column as u32,
            mapping.original,
        );
        return Ok(());
    }

    pub fn find_closest_mapping(
        &self,
        generated_line: u32,
        generated_column: u32,
    ) -> Option<Mapping> {
        match self.mapping_lines.get(&generated_line) {
            Some(line) => match line.mappings.range(..(generated_column + 1)).next_back() {
                Some((column_number, original)) => {
                    return Some(Mapping {
                        generated_line,
                        generated_column: *column_number,
                        original: *original,
                    });
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
        let mut previous_source: i64 = 0;
        let mut previous_original_line: i64 = 0;
        let mut previous_original_column: i64 = 0;
        let mut previous_name: i64 = 0;

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
                    let original_source = original.source as i64;
                    vlq::encode(original_source - previous_source, output)?;
                    previous_source = original_source;

                    let original_line = original.original_line as i64;
                    vlq::encode((original_line - previous_original_line) as i64, output)?;
                    previous_original_line = original_line;

                    let original_column = original.original_column as i64;
                    vlq::encode(original_column - previous_original_column, output)?;
                    previous_original_column = original_column;

                    if let Some(name) = original.name {
                        let original_name = name as i64;
                        vlq::encode(original_name - previous_name, output)?;
                        previous_name = original_name;
                    }
                }

                is_first_mapping = false;
            }

            last_generated_line = cloned_generated_line;
        }

        return Ok(());
    }

    pub fn add_source(&mut self, source: &str) -> Result<u32, SourceMapError> {
        return match self.sources.iter().position(|s| source.eq(s)) {
            Some(i) => Ok(i as u32),
            None => {
                self.sources.push(relatify_path(
                    String::from(source),
                    self.project_root.as_str(),
                )?);

                Ok((self.sources.len() - 1) as u32)
            }
        };
    }

    pub fn add_sources(&mut self, sources: Vec<&str>) -> Result<Vec<u32>, SourceMapError> {
        self.sources.reserve(sources.len());
        let mut result_vec = Vec::with_capacity(sources.len());
        for s in sources.iter() {
            result_vec.push(self.add_source(s)?);
        }
        return Ok(result_vec);
    }

    pub fn get_source_index(&self, source: &str) -> Result<Option<u32>, SourceMapError> {
        let normalized_source = relatify_path(String::from(source), self.project_root.as_str())?;
        match self.sources.iter().position(|s| normalized_source.eq(s)) {
            Some(i) => {
                return Ok(Some(i as u32));
            }
            None => {
                return Ok(None);
            }
        };
    }

    pub fn get_source(&self, index: u32) -> Result<&str, SourceMapError> {
        match self.sources.get(index as usize) {
            Some(v) => {
                return Ok(&v[..]);
            }
            None => {
                return Err(SourceMapError::new(SourceMapErrorType::SourceOutOfRange));
            }
        }
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

    pub fn get_name_index(&self, name: &str) -> Option<u32> {
        match self.names.iter().position(|n| name.eq(n)) {
            Some(i) => {
                return Some(i as u32);
            }
            None => {
                return None;
            }
        };
    }

    pub fn get_name(&self, index: u32) -> Result<&str, SourceMapError> {
        match self.names.get(index as usize) {
            Some(v) => {
                return Ok(&v[..]);
            }
            None => {
                return Err(SourceMapError::new(SourceMapErrorType::NameOutOfRange));
            }
        }
    }

    pub fn set_source_content(
        &mut self,
        source_index: usize,
        source_content: &str,
    ) -> Result<(), SourceMapError> {
        if self.sources.len() == 0 || source_index > self.sources.len() - 1 {
            return Err(SourceMapError::new(SourceMapErrorType::SourceOutOfRange));
        }

        let sources_content_len = self.sources_content.len();
        if sources_content_len >= source_index + 1 {
            self.sources_content[source_index] = String::from(source_content);
        } else {
            self.sources_content
                .reserve((source_index + 1) - sources_content_len);
            let items_to_add = source_index - sources_content_len;
            for _n in 0..items_to_add {
                self.sources_content.push(String::from(""));
            }
            self.sources_content.push(String::from(source_content));
        }

        return Ok(());
    }

    pub fn get_source_content(&self, index: u32) -> Result<&str, SourceMapError> {
        match self.sources_content.get(index as usize) {
            Some(v) => {
                return Ok(&v[..]);
            }
            None => {
                return Err(SourceMapError::new(SourceMapErrorType::SourceOutOfRange));
            }
        }
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

    pub fn add_buffer_mappings(
        &mut self,
        buf: &[u8],
        line_offset: i64,
        column_offset: i64,
    ) -> Result<(), SourceMapError> {
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
                source_indexes.push(self.add_source(source_str)?);
            }
        }

        if let Some(sources_content_buffer) = buffer_map.sources_content() {
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

                self.add_mapping_with_offset(
                    Mapping {
                        generated_line: buffer_mapping.generated_line(),
                        generated_column: buffer_mapping.generated_column(),
                        original: original_location,
                    },
                    line_offset,
                    column_offset,
                )?;
            }
        }

        return Ok(());
    }

    pub fn extends_buffer(&mut self, buf: &[u8]) -> Result<(), SourceMapError> {
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
                source_indexes.push(self.add_source(source_str)?);
            }
        }

        if let Some(sources_content_buffer) = buffer_map.sources_content() {
            self.sources_content.reserve(sources_content_buffer.len());
            for (i, source_content_str) in sources_content_buffer.iter().enumerate() {
                if let Some(source_index) = source_indexes.get(i) {
                    self.set_source_content(*source_index as usize, source_content_str)?;
                }
            }
        }

        // TODO: Figure this out...

        return Ok(());
    }

    pub fn add_vlq_map(
        &mut self,
        input: &[u8],
        sources: Vec<&str>,
        sources_content: Vec<&str>,
        names: Vec<&str>,
        line_offset: i64,
        column_offset: i64,
    ) -> Result<(), SourceMapError> {
        let mut generated_line: i64 = line_offset;
        let mut generated_column: i64 = column_offset;
        let mut original_line = 0;
        let mut original_column = 0;
        let mut source = 0;
        let mut name = 0;

        let source_indexes: Vec<u32> = self.add_sources(sources)?;
        let name_indexes: Vec<u32> = self.add_names(names);

        self.sources_content.reserve(sources_content.len());
        for (i, source_content) in sources_content.iter().enumerate() {
            self.set_source_content(i, source_content)?;
        }

        let mut input = input.iter().cloned().peekable();
        while let Some(byte) = input.peek().cloned() {
            match byte {
                b';' => {
                    generated_line += 1;
                    generated_column = column_offset;
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
                            original_line as u32,
                            original_column as u32,
                            match source_indexes.get(source as usize) {
                                Some(v) => *v,
                                None => {
                                    return Err(SourceMapError::new(
                                        SourceMapErrorType::SourceOutOfRange,
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
                                        ));
                                    }
                                })
                            },
                        ))
                    };

                    if generated_line >= 0 {
                        self.add_mapping(generated_line as u32, generated_column as u32, original);
                    }
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
            return Err(SourceMapError::new_with_reason(
                SourceMapErrorType::UnexpectedNegativeNumber,
                "column + column_offset cannot be negative",
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

    pub fn add_empty_map(
        &mut self,
        source: &str,
        source_content: &str,
        line_offset: i64,
    ) -> Result<(), SourceMapError> {
        let source_index = self.add_source(source)?;
        self.set_source_content(source_index as usize, source_content)?;

        let mut line_count: u32 = 0;
        for _line in source_content.lines() {
            let generated_line = (line_count as i64) + line_offset;
            if generated_line >= 0 {
                self.add_mapping(
                    generated_line as u32,
                    0,
                    Some(OriginalLocation::new(line_count, 0, source_index, None)),
                )
            }

            line_count += 1;
        }

        return Ok(());
    }
}
