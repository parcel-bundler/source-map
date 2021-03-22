use std::collections::BTreeMap;

pub mod mapping;

use mapping::{Mapping};

pub struct MappingLine {
    _mappings: BTreeMap<i32, Mapping>,
}
