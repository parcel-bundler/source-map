use crate::mapping::OriginalLocation;
use crate::sourcemap_error::{SourceMapError, SourceMapErrorType};
use std::collections::BTreeMap;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct MappingLine {
    pub mappings: BTreeMap<u32, Option<OriginalLocation>>,
    pub line_number: u32,
}

impl MappingLine {
    pub fn new(line_number: u32) -> Self {
        Self {
            line_number,
            mappings: BTreeMap::new(),
        }
    }

    pub fn add_mapping(&mut self, generated_column: u32, original: Option<OriginalLocation>) {
        // This should insert or overwrite the value at this key, hopefully it works...
        self.mappings.insert(generated_column, original);
    }

    pub fn offset_columns(
        &mut self,
        generated_column: u32,
        generated_column_offset: i64,
    ) -> Result<(), SourceMapError> {
        let (start_column, overflowed) =
            (generated_column as i64).overflowing_add(generated_column_offset);
        if overflowed || start_column > (u32::MAX as i64) {
            return Err(SourceMapError::new_with_reason(
                SourceMapErrorType::UnexpectedNegativeNumber,
                "column + column_offset cannot be negative",
            ));
        }

        let part_to_remap = self.mappings.split_off(&generated_column);

        // Remove mappings that are within the range that'll get replaced
        let u_start_column = start_column as u32;
        self.mappings.split_off(&u_start_column);

        // re-add remapped mappings
        let abs_offset = generated_column_offset.abs() as u32;
        for (key, value) in part_to_remap {
            self.mappings.insert(
                if generated_column_offset < 0 {
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
