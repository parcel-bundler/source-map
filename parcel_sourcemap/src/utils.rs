// Maybe use https://crates.io/crates/relative-path?
use path_slash::PathExt;
use pathdiff::diff_paths;
use std::path::Path;

#[inline]
pub fn relatify_path(filepath: &Path, root_dir: &Path) -> String {
    if filepath.is_absolute() {
        match diff_paths(filepath, root_dir) {
            Some(relative_path) => {
                return relative_path.to_slash_lossy();
            }
            None => {
                return String::from("");
            }
        }
    } else {
        return filepath.to_slash_lossy();
    }
}
