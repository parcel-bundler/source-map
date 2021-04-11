// Maybe use https://crates.io/crates/relative-path?
use crate::sourcemap_error::{SourceMapError, SourceMapErrorType};
use path_slash::PathExt;
use std::path::Path;

fn path_to_slash(filepath: &Path) -> Result<String, SourceMapError> {
    match filepath.to_slash() {
        Some(v) => {
            return Ok(String::from(v));
        }
        None => {
            return Err(SourceMapError::new(SourceMapErrorType::InvalidFilePath));
        }
    }
}

#[inline]
pub fn relatify_path(filepath: &Path, root_dir: &Path) -> Result<String, SourceMapError> {
    if filepath.is_absolute() {
        let relative_path = filepath.strip_prefix(root_dir)?;
        return path_to_slash(relative_path);
    } else {
        return path_to_slash(filepath);
    }
}
