use crate::sourcemap_error::{SourceMapError, SourceMapErrorType};
use regex::Regex;

#[inline]
pub fn normalize_path(filepath: &str) -> String {
    let re = Regex::new(r"[\\/]+").unwrap();
    let result = re.replace_all(filepath, "/");
    return String::from(&result[..]);
}

#[inline]
pub fn is_absolute_path(filepath: &str) -> bool {
    let re = Regex::new(r"^([a-zA-Z]:){0,1}[\\/]+").unwrap();
    return re.is_match(filepath);
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
