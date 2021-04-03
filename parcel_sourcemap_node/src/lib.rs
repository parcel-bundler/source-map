extern crate napi;
#[macro_use]
extern crate napi_derive;
extern crate parcel_sourcemap;

use napi::{
    CallContext, Either, Env, Error, JsBuffer, JsNull, JsNumber, JsObject, JsString, JsTypedArray,
    JsUndefined, Property, Result, TypedArrayType,
};
use parcel_sourcemap::{SourceMap};

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

#[js_function]
fn get_sources(ctx: CallContext) -> Result<JsObject> {
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

#[js_function(1)]
fn get_source_index(ctx: CallContext) -> Result<Either<JsNumber, JsNull>> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &SourceMap = ctx.env.unwrap(&this)?;

    let source = ctx.get::<JsString>(0)?.into_utf8()?;
    let source_index = source_map_instance.get_source_index(source.as_str()?);

    match source_index {
        Some(i) => {
            return ctx.env.create_uint32(i).map(Either::A);
        }
        None => {
            return ctx.env.get_null().map(Either::B);
        }
    }
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

#[js_function]
fn get_names(ctx: CallContext) -> Result<JsObject> {
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
fn to_buffer(ctx: CallContext) -> Result<JsBuffer> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &SourceMap = ctx.env.unwrap(&this)?;

    let mut buffer_data = Vec::new();
    source_map_instance.write_to_buffer(&mut buffer_data)?;
    return Ok(ctx.env.create_buffer_with_data(buffer_data)?.into_raw());
}

#[js_function(3)]
fn add_buffer_mappings(ctx: CallContext) -> Result<JsUndefined> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &mut SourceMap = ctx.env.unwrap(&this)?;

    let map_buffer = ctx.get::<JsBuffer>(0)?.into_value()?;
    let line_offset = ctx.get::<JsNumber>(1)?.get_int64()?;
    let column_offset = ctx.get::<JsNumber>(2)?.get_int64()?;

    source_map_instance.add_buffer_mappings(&map_buffer[..], line_offset, column_offset)?;
    return ctx.env.get_undefined();
}

#[js_function(1)]
fn add_indexed_mappings(ctx: CallContext) -> Result<JsUndefined> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &mut SourceMap = ctx.env.unwrap(&this)?;

    // TODO: Figure out how this works...
    // let js_mapping_array = ctx.get::<JsTypedArray>(0)?.into_value()?;
    // if js_mapping_array.typedarray_type != TypedArrayType::Int32 {
    //     return Err(Error::new(
    //         napi::Status::InvalidArg,
    //         String::from("argument should be an Int32Array"),
    //     ));
    // }

    // let mut generated_line: u32 = 0; // 0
    // let mut generated_column: u32 = 0; // 1
    // let mut original_line: i32 = 0; // 2
    // let mut original_column: i32 = 0; // 3
    // let mut original_source: i32 = 0; // 4
    // for (i, value) in js_mapping_array.iter().enumerate() {
    //     match i % 6 {
    //         0 => {
    //             generated_line = value;
    //         }
    //         1 => {
    //             generated_column = value;
    //         }
    //         2 => {
    //             original_line = value;
    //         }
    //         3 => {
    //             original_column = value;
    //         }
    //         4 => {
    //             original_source = value;
    //         }
    //         5 => {
    //             // TODO: Add support for original position...
    //             source_map_instance.add_mapping(generated_line, generated_column, None);
    //         }
    //     }
    // }

    return ctx.env.get_undefined();
}

#[js_function(1)]
fn watcher_class_contructor(ctx: CallContext) -> Result<JsUndefined> {
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
    let add_name_method = Property::new(&env, "addName")?.with_method(add_name);
    let get_name_method = Property::new(&env, "getName")?.with_method(get_name);
    let get_names_method = Property::new(&env, "getNames")?.with_method(get_names);
    let get_name_index_method = Property::new(&env, "getNameIndex")?.with_method(get_name_index);
    let to_buffer_method = Property::new(&env, "toBuffer")?.with_method(to_buffer);
    let add_buffer_mappings_method =
        Property::new(&env, "addBufferMappings")?.with_method(add_buffer_mappings);
    let add_indexed_mappings_method =
        Property::new(&env, "addIndexedMappings")?.with_method(add_indexed_mappings);
    let watcher_class = env.define_class(
        "SourceMap",
        watcher_class_contructor,
        &[
            add_source_method,
            get_source_method,
            get_sources_method,
            get_source_index_method,
            add_name_method,
            get_name_method,
            get_names_method,
            get_name_index_method,
            to_buffer_method,
            add_buffer_mappings_method,
            add_indexed_mappings_method,
        ],
    )?;
    exports.set_named_property("SourceMap", watcher_class)?;
    return Ok(());
}
