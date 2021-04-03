extern crate napi;
#[macro_use]
extern crate napi_derive;
extern crate parcel_sourcemap;

use napi::{
    CallContext, Either, Env, JsNull, JsNumber, JsObject, JsString, JsUndefined, Property, Result,
};
use parcel_sourcemap::SourceMap;

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
        ],
    )?;
    exports.set_named_property("SourceMap", watcher_class)?;
    return Ok(());
}
