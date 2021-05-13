extern crate bincode;

pub mod mapping;
pub mod mapping_line;
pub mod sourcemap_error;
pub mod utils;
mod vlq_utils;

use crate::utils::make_relative_path;
pub use mapping::{Mapping, OriginalLocation};
use mapping_line::MappingLine;
pub use sourcemap_error::{SourceMapError, SourceMapErrorType};
use std::collections::BTreeMap;
use std::io;

use serde::{Deserialize, Serialize};
use vlq;
use vlq_utils::{is_mapping_separator, read_relative_vlq};

#[derive(Serialize, Deserialize, Debug)]
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

    pub fn add_source(&mut self, source: &str) -> u32 {
        let relative_source = make_relative_path(self.project_root.as_str(), source);
        match self.sources.iter().position(|s| relative_source.eq(s)) {
            Some(i) => return i as u32,
            None => {
                self.sources.push(relative_source);
                return (self.sources.len() - 1) as u32;
            }
        };
    }

    pub fn add_sources(&mut self, sources: Vec<&str>) -> Vec<u32> {
        self.sources.reserve(sources.len());
        let mut result_vec = Vec::with_capacity(sources.len());
        for s in sources.iter() {
            result_vec.push(self.add_source(s));
        }
        return result_vec;
    }

    pub fn get_source_index(&self, source: &str) -> Result<Option<u32>, SourceMapError> {
        let normalized_source = make_relative_path(self.project_root.as_str(), source);
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

    // Write the sourcemap instance to a buffer
    pub fn to_buffer(&self, output: &mut Vec<u8>) -> Result<(), SourceMapError> {
        output.clear();
        bincode::serialize_into(output, self)?;
        return Ok(());
    }

    // Create a sourcemap instance from a buffer
    pub fn from_buffer(buf: &[u8]) -> Result<SourceMap, SourceMapError> {
        let sourcemap: SourceMap = bincode::deserialize::<SourceMap>(buf)?;
        return Ok(sourcemap);
    }

    pub fn add_sourcemap(
        &mut self,
        sourcemap: &SourceMap,
        line_offset: i64,
        column_offset: i64,
    ) -> Result<(), SourceMapError> {
        self.sources.reserve(sourcemap.sources.len());
        let mut source_indexes = Vec::with_capacity(sourcemap.sources.len());
        for s in sourcemap.sources.iter() {
            source_indexes.push(self.add_source(s));
        }

        self.names.reserve(sourcemap.names.len());
        let mut names_indexes = Vec::with_capacity(sourcemap.names.len());
        for n in sourcemap.names.iter() {
            names_indexes.push(self.add_name(n));
        }

        self.sources_content
            .reserve(sourcemap.sources_content.len());
        for (i, source_content_str) in sourcemap.sources_content.iter().enumerate() {
            if let Some(source_index) = source_indexes.get(i) {
                self.set_source_content(*source_index as usize, source_content_str)?;
            }
        }

        for (line, mapping_line) in sourcemap.mapping_lines.iter() {
            let generated_line = (*line as i64) + line_offset;
            if generated_line >= 0 {
                for (column, original_location) in mapping_line.mappings.iter() {
                    let generated_column = (*column as i64) + column_offset;

                    if generated_column >= 0 {
                        self.add_mapping(
                            generated_line as u32,
                            generated_column as u32,
                            match *original_location {
                                Some(original_mapping_location) => {
                                    Some(OriginalLocation::new(
                                        original_mapping_location.original_line,
                                        original_mapping_location.original_column,
                                        match source_indexes
                                            .get(original_mapping_location.source as usize)
                                        {
                                            Some(new_source_index) => *new_source_index,
                                            None => {
                                                return Err(SourceMapError::new(
                                                    SourceMapErrorType::SourceOutOfRange,
                                                ));
                                            }
                                        },
                                        match original_mapping_location.name {
                                            Some(name_index) => {
                                                match names_indexes.get(name_index as usize) {
                                                    Some(new_name_index) => Some(*new_name_index),
                                                    None => {
                                                        return Err(SourceMapError::new(
                                                            SourceMapErrorType::NameOutOfRange,
                                                        ));
                                                    }
                                                }
                                            }
                                            None => None,
                                        },
                                    ))
                                }
                                None => {
                                    None
                                }
                            },
                        );
                    }
                }
            }
        }

        return Ok(());
    }
    
    pub fn extends(&mut self, original_sourcemap: &SourceMap) -> Result<(), SourceMapError> {
        self.sources.reserve(original_sourcemap.sources.len());
        let mut source_indexes = Vec::with_capacity(original_sourcemap.sources.len());
        for s in original_sourcemap.sources.iter() {
            source_indexes.push(self.add_source(s));
        }

        self.names.reserve(original_sourcemap.names.len());
        let mut names_indexes = Vec::with_capacity(original_sourcemap.names.len());
        for n in original_sourcemap.names.iter() {
            names_indexes.push(self.add_name(n));
        }

        self.sources_content
            .reserve(original_sourcemap.sources_content.len());
        for (i, source_content_str) in original_sourcemap.sources_content.iter().enumerate() {
            if let Some(source_index) = source_indexes.get(i) {
                self.set_source_content(*source_index as usize, source_content_str)?;
            }
        }

        for (_generated_line, line_content) in self.mapping_lines.iter_mut() {
            for (_generated_column, original_location_option) in line_content.mappings.iter_mut() {
                if let Some(original_location) = original_location_option {
                    let found_mapping = original_sourcemap.find_closest_mapping(
                        original_location.original_line,
                        original_location.original_column,
                    );
                    match found_mapping {
                        Some(original_mapping) => match original_mapping.original {
                            Some(original_mapping_location) => {
                                *original_location_option = Some(OriginalLocation::new(
                                    original_mapping_location.original_line,
                                    original_mapping_location.original_column,
                                    match source_indexes
                                        .get(original_mapping_location.source as usize)
                                    {
                                        Some(new_source_index) => *new_source_index,
                                        None => {
                                            return Err(SourceMapError::new(
                                                SourceMapErrorType::SourceOutOfRange,
                                            ));
                                        }
                                    },
                                    match original_mapping_location.name {
                                        Some(name_index) => {
                                            match names_indexes.get(name_index as usize) {
                                                Some(new_name_index) => Some(*new_name_index),
                                                None => {
                                                    return Err(SourceMapError::new(
                                                        SourceMapErrorType::NameOutOfRange,
                                                    ));
                                                }
                                            }
                                        }
                                        None => None,
                                    },
                                ));
                            }
                            None => {
                                *original_location_option = None;
                            }
                        },
                        None => {
                            *original_location_option = None;
                        }
                    }
                }
            }
        }

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

        let source_indexes: Vec<u32> = self.add_sources(sources);
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
        let source_index = self.add_source(source);
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

#[test]
fn test_buffers() {
    let map = SourceMap::new("/");
    let mut output = Vec::new();
    match map.to_buffer(&mut output) {
        Ok(_) => {}
        Err(err) => panic!(err),
    }
    match SourceMap::from_buffer(&output) {
        Ok(map) => {
            println!("{:?}", map)
        }
        Err(err) => panic!(err),
    }
}
