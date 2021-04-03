extern crate napi;
#[macro_use]
extern crate napi_derive;
extern crate parcel_sourcemap;

use napi::{CallContext, Env, JsNull, JsObject, JsString, JsUndefined, Property, Ref, Result};
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
fn add_name(ctx: CallContext) -> Result<JsUndefined> {
    let this: JsObject = ctx.this_unchecked();
    let source_map_instance: &mut SourceMap = ctx.env.unwrap(&this)?;

    let name = ctx.get::<JsString>(0)?.into_utf8()?;
    source_map_instance.add_name(name.as_str()?);

    return ctx.env.get_undefined();
}

#[js_function]
fn watcher_class_contructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut this: JsObject = ctx.this_unchecked();
    ctx.env.wrap(&mut this, SourceMap::new())?;
    return ctx.env.get_undefined();
}

#[module_exports]
fn init(mut exports: JsObject, env: Env) -> Result<()> {
    let add_source_method = Property::new(&env, "addSource")?.with_method(add_source);
    let add_name_method = Property::new(&env, "addName")?.with_method(add_name);
    let watcher_class = env.define_class(
        "SourceMap",
        watcher_class_contructor,
        &[add_source_method, add_name_method],
    )?;
    exports.set_named_property("SourceMap", watcher_class)?;
    return Ok(());
}
