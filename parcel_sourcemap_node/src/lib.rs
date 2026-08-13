use napi::{
    bindgen_prelude::{Array, Buffer, Int32Array, JsObjectValue, Object, ToNapiValue},
    Env, Result,
};
use napi_derive::napi;
use parcel_sourcemap::{Mapping, OriginalLocation, SourceMap, SourceMapError};
use rkyv::util::AlignedVec;

#[cfg(target_os = "macos")]
#[global_allocator]
static GLOBAL: jemallocator::Jemalloc = jemallocator::Jemalloc;

#[napi(js_name = "SourceMap")]
pub struct JsSourceMap {
    source_map: SourceMap,
}

#[napi]
impl JsSourceMap {
    #[napi(constructor)]
    pub fn new(project_root: String, buffer: Option<Buffer>) -> Result<Self> {
        let source_map = match buffer {
            Some(buffer) => {
                SourceMap::from_buffer(&project_root, &buffer).map_err(to_napi_error)?
            }
            None => SourceMap::new(&project_root),
        };
        Ok(JsSourceMap { source_map })
    }

    #[napi]
    pub fn add_source(&mut self, source: String) -> u32 {
        self.source_map.add_source(&source)
    }

    #[napi]
    pub fn get_source(&mut self, source_index: u32) -> String {
        match self.source_map.get_source(source_index) {
            Ok(source) => source.to_owned(),
            Err(_err) => String::new(),
        }
    }

    #[napi]
    pub fn get_sources(&self) -> &Vec<String> {
        self.source_map.get_sources()
    }

    #[napi]
    pub fn get_sources_content(&self) -> &Vec<String> {
        self.source_map.get_sources_content()
    }

    #[napi]
    pub fn get_source_index(&self, source: String) -> Result<i32> {
        let source_index = self
            .source_map
            .get_source_index(&source)
            .map_err(to_napi_error)?;
        match source_index {
            Some(i) => Ok(i as i32),
            None => Ok(-1),
        }
    }

    #[napi]
    pub fn set_source_content_by_source(
        &mut self,
        source: String,
        source_content: String,
    ) -> Result<()> {
        let source_index = self.source_map.add_source(&source) as usize;
        self.source_map
            .set_source_content(source_index, &source_content)
            .map_err(to_napi_error)?;
        Ok(())
    }

    #[napi]
    pub fn get_source_content_by_source(&self, source: String) -> Result<String> {
        let source_index = self
            .source_map
            .get_source_index(&source)
            .map_err(to_napi_error)?;
        match source_index {
            Some(i) => self
                .source_map
                .get_source_content(i)
                .map(|s| s.to_owned())
                .map_err(to_napi_error),
            None => Ok(String::new()),
        }
    }

    #[napi]
    pub fn add_name(&mut self, name: String) -> u32 {
        self.source_map.add_name(&name)
    }

    #[napi]
    pub fn get_name(&self, name_index: u32) -> String {
        match self.source_map.get_name(name_index) {
            Ok(name) => name.to_owned(),
            Err(_) => String::new(),
        }
    }

    #[napi]
    pub fn get_names(&self) -> &Vec<String> {
        self.source_map.get_names()
    }

    #[napi]
    pub fn get_name_index(&self, name: String) -> i32 {
        let name_index = self.source_map.get_name_index(&name);
        match name_index {
            Some(i) => i as i32,
            None => -1,
        }
    }

    #[napi]
    pub fn get_mappings(&self, env: Env) -> Result<Array<'_>> {
        let mappings = self.source_map.get_mappings();
        let mut mapping_objects = Vec::with_capacity(mappings.len());
        for mapping in &mappings {
            mapping_objects.push(mapping_to_js_object(&env, mapping)?);
        }
        Array::from_vec(&env, mapping_objects)
    }

    #[napi]
    pub fn to_buffer(&self) -> Result<Buffer> {
        let mut buffer_data = AlignedVec::new();
        self.source_map
            .to_buffer(&mut buffer_data)
            .map_err(to_napi_error)?;

        Ok(buffer_data.into_vec().into())
    }

    #[napi]
    pub fn add_source_map(
        &mut self,
        sourcemap_object: &mut JsSourceMap,
        line_offset: i64,
    ) -> Result<()> {
        self.source_map
            .add_sourcemap(&mut sourcemap_object.source_map, line_offset)
            .map_err(to_napi_error)?;
        Ok(())
    }

    #[napi(js_name = "addVLQMap")]
    pub fn add_vlq_map(
        &mut self,
        vlq_mappings: String,
        sources: Vec<String>,
        sources_content: Vec<String>,
        names: Vec<String>,
        line_offset: i64,
        column_offset: i64,
    ) -> Result<()> {
        self.source_map
            .add_vlq_map(
                vlq_mappings.as_bytes(),
                sources,
                sources_content,
                names,
                line_offset,
                column_offset,
            )
            .map_err(to_napi_error)?;
        Ok(())
    }

    #[napi(js_name = "toVLQ")]
    pub fn to_vlq(&mut self, env: Env) -> Result<Object<'_>> {
        let mut vlq_output: Vec<u8> = vec![];
        self.source_map
            .write_vlq(&mut vlq_output)
            .map_err(to_napi_error)?;
        let vlq_string = env.create_string_latin1(vlq_output.as_slice())?;
        let mut result_obj = Object::new(&env)?;
        result_obj.set_named_property("mappings", vlq_string)?;
        result_obj.set_named_property("sources", unsafe {
            // This avoids copying the strings twice - they are converted directly to JS strings rather than cloned into a new Vec first.
            Object::from_raw(
                env.raw(),
                ToNapiValue::to_napi_value(env.raw(), self.get_sources())?,
            )
        })?;
        result_obj.set_named_property("sourcesContent", unsafe {
            Object::from_raw(
                env.raw(),
                ToNapiValue::to_napi_value(env.raw(), self.get_sources_content())?,
            )
        })?;
        result_obj.set_named_property("names", unsafe {
            Object::from_raw(
                env.raw(),
                ToNapiValue::to_napi_value(env.raw(), self.get_names())?,
            )
        })?;
        Ok(result_obj)
    }

    #[napi]
    pub fn add_indexed_mappings(&mut self, mappings: Int32Array) -> Result<()> {
        let mappings_arr: &[i32] = mappings.as_ref();
        let mappings_count = mappings_arr.len();

        let mut generated_line: u32 = 0; // 0
        let mut generated_column: u32 = 0; // 1
        let mut original_line: i32 = 0; // 2
        let mut original_column: i32 = 0; // 3
        let mut original_source: i32 = 0; // 4
        for (i, value) in mappings_arr.iter().enumerate().take(mappings_count) {
            let value = *value;
            match i % 6 {
                0 => {
                    generated_line = value as u32;
                }
                1 => {
                    generated_column = value as u32;
                }
                2 => {
                    original_line = value;
                }
                3 => {
                    original_column = value;
                }
                4 => {
                    original_source = value;
                }
                5 => {
                    self.source_map.add_mapping(
                        generated_line,
                        generated_column,
                        if original_line > -1 && original_column > -1 && original_source > -1 {
                            Some(OriginalLocation {
                                original_line: original_line as u32,
                                original_column: original_column as u32,
                                source: original_source as u32,
                                name: if value > -1 { Some(value as u32) } else { None },
                            })
                        } else {
                            None
                        },
                    );
                }
                _ => unreachable!(),
            }
        }

        Ok(())
    }

    #[napi]
    pub fn offset_lines(&mut self, generated_line: u32, generated_line_offset: i64) -> Result<()> {
        self.source_map
            .offset_lines(generated_line, generated_line_offset)
            .map_err(to_napi_error)
    }

    #[napi]
    pub fn offset_columns(
        &mut self,
        generated_line: u32,
        generated_column: u32,
        generated_column_offset: i64,
    ) -> Result<()> {
        self.source_map
            .offset_columns(generated_line, generated_column, generated_column_offset)
            .map_err(to_napi_error)
    }

    #[napi]
    pub fn add_empty_map(
        &mut self,
        source: String,
        source_content: String,
        line_offset: i64,
    ) -> Result<()> {
        self.source_map
            .add_empty_map(&source, &source_content, line_offset)
            .map_err(to_napi_error)
    }

    #[napi]
    pub fn extends(&mut self, original_sourcemap: &mut JsSourceMap) -> Result<()> {
        self.source_map
            .extends(&mut original_sourcemap.source_map)
            .map_err(to_napi_error)
    }

    #[napi]
    pub fn find_closest_mapping<'a>(
        &mut self,
        generated_line: u32,
        generated_column: u32,
        env: &'a Env,
    ) -> Result<Option<Object<'a>>> {
        match self
            .source_map
            .find_closest_mapping(generated_line, generated_column)
        {
            Some(mapping) => Ok(Some(mapping_to_js_object(env, &mapping)?)),
            None => Ok(None),
        }
    }

    #[napi]
    pub fn get_project_root(&self) -> String {
        self.source_map.project_root.clone()
    }
}

fn mapping_to_js_object<'a>(env: &'a Env, mapping: &Mapping) -> Result<Object<'a>> {
    let mut mapping_obj = Object::new(env)?;

    let mut generated_position_obj = Object::new(env)?;
    generated_position_obj.set_named_property("line", mapping.generated_line + 1)?;
    generated_position_obj.set_named_property("column", mapping.generated_column)?;
    mapping_obj.set_named_property("generated", generated_position_obj)?;

    let original_position = mapping.original;
    if let Some(original_position) = original_position {
        let mut original_position_obj = Object::new(env)?;
        original_position_obj.set_named_property("line", original_position.original_line + 1)?;
        original_position_obj.set_named_property("column", original_position.original_column)?;
        mapping_obj.set_named_property("original", original_position_obj)?;

        mapping_obj.set_named_property("source", original_position.source)?;

        if let Some(name) = original_position.name {
            mapping_obj.set_named_property("name", name)?;
        }
    }

    Ok(mapping_obj)
}

#[inline]
fn to_napi_error(err: SourceMapError) -> napi::Error {
    napi::Error::new(napi::Status::GenericFailure, err.to_string())
}
