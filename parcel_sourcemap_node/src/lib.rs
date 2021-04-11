extern crate napi;
#[macro_use]
extern crate napi_derive;
extern crate parcel_sourcemap;

use napi::{
    CallContext, Either, Env, JsBuffer, JsNull, JsNumber, JsObject, JsString, JsUndefined,
    Property, Result,
};
use parcel_sourcemap::{OriginalLocation, SourceMap};

#[js_function(1)]
fn add_source(ctx: CallContext) -> Result<JsUndefined> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &mut SourceMap = ctx.env.unwrap(&this)?;

    let source = ctx.get::<JsString>(0)?.into_utf8()?;
    source_map_instance.add_source(source.as_str()?);

    return ctx.env.get_undefined();
}

#[js_function(1)]
fn get_source(ctx: CallContext) -> Result<JsString> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &SourceMap = ctx.env.unwrap(&this)?;

    let source_index = ctx.get::<JsNumber>(0)?.get_uint32()?;
    let source = source_map_instance.get_source(source_index)?;

    return ctx.env.create_string(source);
}

fn _get_sources(ctx: &CallContext) -> Result<JsObject> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &SourceMap = ctx.env.unwrap(&this)?;

    let mut napi_sources_array = ctx
        .env
        .create_array_with_length(source_map_instance.sources.len())?;
    for (source_index, source) in source_map_instance.sources.iter().enumerate() {
        napi_sources_array.set_element(source_index as u32, ctx.env.create_string(&source[..])?)?;
    }

    // Return array
    return Ok(napi_sources_array);
}

#[js_function]
fn get_sources(ctx: CallContext) -> Result<JsObject> {
    return _get_sources(&ctx);
}

#[js_function]
fn get_sources_content(ctx: CallContext) -> Result<JsObject> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &SourceMap = ctx.env.unwrap(&this)?;

    let mut napi_sources_content_array = ctx
        .env
        .create_array_with_length(source_map_instance.sources_content.len())?;
    for (source_index, source_content) in source_map_instance.sources_content.iter().enumerate() {
        napi_sources_content_array.set_element(
            source_index as u32,
            ctx.env.create_string(&source_content[..])?,
        )?;
    }

    // Return array
    return Ok(napi_sources_content_array);
}

#[js_function(1)]
fn get_source_index(ctx: CallContext) -> Result<JsNumber> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &SourceMap = ctx.env.unwrap(&this)?;

    let source = ctx.get::<JsString>(0)?.into_utf8()?;
    let source_index = source_map_instance.get_source_index(source.as_str()?);

    match source_index {
        Some(i) => {
            return ctx.env.create_uint32(i);
        }
        None => {
            return ctx.env.create_int32(-1);
        }
    }
}

#[js_function(1)]
fn set_source_content(ctx: CallContext) -> Result<JsUndefined> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &mut SourceMap = ctx.env.unwrap(&this)?;

    let source_index = ctx.get::<JsNumber>(0)?.get_uint32()? as usize;
    let source_content = ctx.get::<JsString>(1)?.into_utf8()?;
    source_map_instance.set_source_content(source_index, source_content.as_str()?)?;

    return ctx.env.get_undefined();
}

#[js_function(1)]
fn add_name(ctx: CallContext) -> Result<JsUndefined> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &mut SourceMap = ctx.env.unwrap(&this)?;

    let name = ctx.get::<JsString>(0)?.into_utf8()?;
    source_map_instance.add_name(name.as_str()?);

    return ctx.env.get_undefined();
}

#[js_function(1)]
fn get_name(ctx: CallContext) -> Result<JsString> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &SourceMap = ctx.env.unwrap(&this)?;

    let name_index = ctx.get::<JsNumber>(0)?.get_uint32()?;
    let name = source_map_instance.get_name(name_index)?;

    return ctx.env.create_string(name);
}

fn _get_names(ctx: &CallContext) -> Result<JsObject> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &SourceMap = ctx.env.unwrap(&this)?;

    let mut napi_names_array = ctx
        .env
        .create_array_with_length(source_map_instance.names.len())?;
    for (name_index, name) in source_map_instance.names.iter().enumerate() {
        napi_names_array.set_element(name_index as u32, ctx.env.create_string(&name[..])?)?;
    }

    // Return array
    return Ok(napi_names_array);
}

#[js_function]
fn get_names(ctx: CallContext) -> Result<JsObject> {
    return _get_names(&ctx);
}

#[js_function(1)]
fn get_name_index(ctx: CallContext) -> Result<Either<JsNumber, JsNull>> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &SourceMap = ctx.env.unwrap(&this)?;

    let name = ctx.get::<JsString>(0)?.into_utf8()?;
    let name_index = source_map_instance.get_name_index(name.as_str()?);

    match name_index {
        Some(i) => {
            return ctx.env.create_uint32(i).map(Either::A);
        }
        None => {
            return ctx.env.get_null().map(Either::B);
        }
    }
}

#[js_function]
fn get_mappings(ctx: CallContext) -> Result<JsObject> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &SourceMap = ctx.env.unwrap(&this)?;

    let mut mappings_arr = ctx.env.create_array()?;
    let mut index: u32 = 0;
    for (generated_line, mapping_line) in source_map_instance.mapping_lines.iter() {
        for (generated_column, mapping) in mapping_line.mappings.iter() {
            let mut mapping_obj = ctx.env.create_object()?;

            let mut generated_position_obj = ctx.env.create_object()?;
            generated_position_obj
                .set_named_property("line", ctx.env.create_uint32((*generated_line) + 1)?)?;
            generated_position_obj
                .set_named_property("column", ctx.env.create_uint32(*generated_column)?)?;
            mapping_obj.set_named_property("generated", generated_position_obj)?;

            if let Some(original_position) = mapping {
                let mut original_position_obj = ctx.env.create_object()?;
                original_position_obj.set_named_property(
                    "line",
                    ctx.env.create_uint32(original_position.original_line + 1)?,
                )?;
                original_position_obj.set_named_property(
                    "column",
                    ctx.env.create_uint32(original_position.original_column)?,
                )?;
                mapping_obj.set_named_property("original", original_position_obj)?;

                mapping_obj.set_named_property(
                    "source",
                    ctx.env.create_uint32(original_position.source)?,
                )?;

                if let Some(name) = original_position.name {
                    mapping_obj.set_named_property("name", ctx.env.create_uint32(name)?)?;
                }
            }

            mappings_arr.set_element(index, mapping_obj)?;
            index += 1;
        }
    }
    return Ok(mappings_arr);
}

#[js_function]
fn to_buffer(ctx: CallContext) -> Result<JsBuffer> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &SourceMap = ctx.env.unwrap(&this)?;

    let mut buffer_data = Vec::new();
    source_map_instance.write_to_buffer(&mut buffer_data)?;
    return Ok(ctx.env.create_buffer_with_data(buffer_data)?.into_raw());
}

#[js_function(3)]
fn add_buffer_map(ctx: CallContext) -> Result<JsUndefined> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &mut SourceMap = ctx.env.unwrap(&this)?;

    let map_buffer = ctx.get::<JsBuffer>(0)?.into_value()?;
    let line_offset = ctx.get::<JsNumber>(1)?.get_int64()?;
    let column_offset = ctx.get::<JsNumber>(2)?.get_int64()?;

    source_map_instance.add_buffer_mappings(&map_buffer[..], line_offset, column_offset)?;
    return ctx.env.get_undefined();
}

#[js_function(6)]
fn add_vlq_map(ctx: CallContext) -> Result<JsUndefined> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &mut SourceMap = ctx.env.unwrap(&this)?;

    let vlq_mappings = ctx.get::<JsString>(0)?.into_utf8()?;

    let js_sources_arr = ctx.get::<JsObject>(1)?;
    let js_sources_arr_len: u32 = js_sources_arr
        .get_named_property::<JsNumber>("length")?
        .get_uint32()?;
    let mut sources = Vec::with_capacity(js_sources_arr_len as usize);
    for i in 0..js_sources_arr_len {
        sources.push(
            js_sources_arr
                .get_element::<JsString>(i)?
                .into_utf8()?
                .into_owned()?,
        );
    }

    let js_sources_content_arr = ctx.get::<JsObject>(2)?;
    let js_sources_content_arr_len: u32 = js_sources_arr
        .get_named_property::<JsNumber>("length")?
        .get_uint32()?;
    let mut sources_content = Vec::with_capacity(js_sources_content_arr_len as usize);
    for i in 0..js_sources_content_arr_len {
        sources_content.push(
            js_sources_content_arr
                .get_element::<JsString>(i)?
                .into_utf8()?
                .into_owned()?,
        );
    }

    let js_names_arr = ctx.get::<JsObject>(3)?;
    let js_names_arr_len: u32 = js_names_arr
        .get_named_property::<JsNumber>("length")?
        .get_uint32()?;
    let mut names = Vec::with_capacity(js_names_arr_len as usize);
    for i in 0..js_names_arr_len {
        names.push(
            js_names_arr
                .get_element::<JsString>(i)?
                .into_utf8()?
                .into_owned()?,
        );
    }

    let line_offset = ctx.get::<JsNumber>(4)?.get_int64()?;
    let column_offset = ctx.get::<JsNumber>(5)?.get_int64()?;

    source_map_instance.add_vql_map(
        vlq_mappings.as_slice(),
        sources.iter().map(|s| &s[..]).collect(),
        sources_content.iter().map(|s| &s[..]).collect(),
        names.iter().map(|n| &n[..]).collect(),
        line_offset,
        column_offset,
    )?;

    return ctx.env.get_undefined();
}

#[js_function]
fn to_vlq(ctx: CallContext) -> Result<JsObject> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &mut SourceMap = ctx.env.unwrap(&this)?;

    let mut vlq_output: Vec<u8> = vec![];
    source_map_instance.write_vlq(&mut vlq_output)?;
    let vlq_string = ctx.env.create_string_from_vec_u8(vlq_output)?;
    let mut result_obj: JsObject = ctx.env.create_object()?;
    result_obj.set_named_property("mappings", vlq_string)?;
    result_obj.set_named_property("sources", _get_sources(&ctx)?)?;
    result_obj.set_named_property("names", _get_names(&ctx)?)?;

    return Ok(result_obj);
}

#[js_function(1)]
fn add_indexed_mappings(ctx: CallContext) -> Result<JsUndefined> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &mut SourceMap = ctx.env.unwrap(&this)?;

    // TODO: Figure out a more optimal way of handling typed arrays...
    let js_mapping_arr = ctx.get::<JsObject>(0)?;
    let length: u32 = js_mapping_arr
        .get_named_property::<JsNumber>("length")?
        .get_uint32()?;

    let mut generated_line: u32 = 0; // 0
    let mut generated_column: u32 = 0; // 1
    let mut original_line: i32 = 0; // 2
    let mut original_column: i32 = 0; // 3
    let mut original_source: i32 = 0; // 4
    for i in 0..length {
        let value: i32 = js_mapping_arr.get_element::<JsNumber>(i)?.get_int32()?;

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
                source_map_instance.add_mapping(
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
            // This is a rust bug? i % 6 can never return anything else...
            _ => (),
        }
    }

    return ctx.env.get_undefined();
}

#[js_function(2)]
fn offset_lines(ctx: CallContext) -> Result<JsUndefined> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &mut SourceMap = ctx.env.unwrap(&this)?;

    let generated_line = ctx.get::<JsNumber>(0)?.get_uint32()?;
    let generated_line_offset = ctx.get::<JsNumber>(1)?.get_int64()?;
    source_map_instance.offset_lines(generated_line, generated_line_offset)?;
    return ctx.env.get_undefined();
}

#[js_function(3)]
fn offset_columns(ctx: CallContext) -> Result<JsUndefined> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &mut SourceMap = ctx.env.unwrap(&this)?;

    let generated_line = ctx.get::<JsNumber>(0)?.get_uint32()?;
    let generated_column = ctx.get::<JsNumber>(1)?.get_uint32()?;
    let generated_column_offset = ctx.get::<JsNumber>(2)?.get_int64()?;

    source_map_instance.offset_columns(
        generated_line,
        generated_column,
        generated_column_offset,
    )?;
    return ctx.env.get_undefined();
}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut this: JsObject = ctx.this_unchecked();
    let project_root = ctx.get::<JsString>(0)?.into_utf8()?;
    ctx.env
        .wrap(&mut this, SourceMap::new(project_root.as_str()?))?;
    return ctx.env.get_undefined();
}

#[module_exports]
fn init(mut exports: JsObject, env: Env) -> Result<()> {
    let add_source_method = Property::new(&env, "addSource")?.with_method(add_source);
    let get_source_method = Property::new(&env, "getSource")?.with_method(get_source);
    let get_sources_method = Property::new(&env, "getSources")?.with_method(get_sources);
    let get_source_index_method =
        Property::new(&env, "getSourceIndex")?.with_method(get_source_index);
    let set_source_content_method =
        Property::new(&env, "setSourceContent")?.with_method(set_source_content);
    let get_sources_content_method =
        Property::new(&env, "getSourcesContent")?.with_method(get_sources_content);
    let add_name_method = Property::new(&env, "addName")?.with_method(add_name);
    let get_name_method = Property::new(&env, "getName")?.with_method(get_name);
    let get_names_method = Property::new(&env, "getNames")?.with_method(get_names);
    let get_name_index_method = Property::new(&env, "getNameIndex")?.with_method(get_name_index);
    let get_mappings_method = Property::new(&env, "getMappings")?.with_method(get_mappings);
    let to_buffer_method = Property::new(&env, "toBuffer")?.with_method(to_buffer);
    let add_buffer_map_method = Property::new(&env, "addBufferMap")?.with_method(add_buffer_map);
    let add_indexed_mappings_method =
        Property::new(&env, "addIndexedMappings")?.with_method(add_indexed_mappings);
    let add_vlq_map_method = Property::new(&env, "addVLQMap")?.with_method(add_vlq_map);
    let to_vlq_method = Property::new(&env, "toVLQ")?.with_method(to_vlq);
    let offset_lines_method = Property::new(&env, "offsetLines")?.with_method(offset_lines);
    let offset_columns_method = Property::new(&env, "offsetColumns")?.with_method(offset_columns);
    let watcher_class = env.define_class(
        "SourceMap",
        constructor,
        &[
            add_source_method,
            get_source_method,
            get_sources_method,
            get_source_index_method,
            set_source_content_method,
            get_sources_content_method,
            add_name_method,
            get_name_method,
            get_names_method,
            get_name_index_method,
            get_mappings_method,
            add_buffer_map_method,
            add_indexed_mappings_method,
            add_vlq_map_method,
            to_buffer_method,
            to_vlq_method,
            offset_lines_method,
            offset_columns_method,
        ],
    )?;
    exports.set_named_property("SourceMap", watcher_class)?;
    return Ok(());
}
