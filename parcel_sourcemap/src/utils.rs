use crate::sourcemap_error::{SourceMapError, SourceMapErrorType};
use regex::Regex;
use lazy_static::lazy_static;

lazy_static! {
    static ref PATH_SEPERATOR_REGEX: Regex = Regex::new(r"[\\/]+").unwrap();
    static ref ABS_PATH_REGEX: Regex = Regex::new(r"^([a-zA-Z]:){0,1}[\\/]+").unwrap();
}

#[inline]
pub fn normalize_path(filepath: &str) -> String {
    let result = PATH_SEPERATOR_REGEX.replace_all(filepath, "/");
    return result.into_owned();
}

#[inline]
pub fn is_absolute_path(filepath: &str) -> bool {
    return ABS_PATH_REGEX.is_match(filepath);
}

#[inline]
pub fn relatify_path(filepath: String, root_dir: &str) -> Result<String, SourceMapError> {
    let filepath_ref = &filepath[..];
    // Make absolute paths relative to the rootDir
    if is_absolute_path(filepath_ref) {
        let relative_path = filepath.replace(root_dir, "./");
        return Ok(normalize_path(&relative_path[..]));
    }

    // Prefix relative paths with ./ as it makes it more clear and probably prevents issues
    match filepath.chars().nth(0) {
        Some(v) => {
            if v != '.' {
                let mut result_string = String::from("./");
                result_string.push_str(&filepath[..]);
                return Ok(normalize_path(&result_string[..]));
            } else {
                return Ok(normalize_path(&filepath[..]));
            }
        }
        None => return Err(SourceMapError::new(SourceMapErrorType::InvalidFilePath)),
    }
}
