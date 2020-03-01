# Source Maps

This module is a very early work in progress, which has as end goal to allow lightning fast parsing, compiling and manipulation of sourcemaps, while being able to stringify and parse to a minimal footprint.

Mozilla's SourceMap module already handles most of this and this module is heavily based and inspired by the sourcemaps module, however this is one class to do everything, consuming, generating and modifying entirely written in cpp. Which should result in less overhead and faster sourcemap `read -> manipulate -> generate` and `read -> generate` operations.

## Performance

This also removes overhead of I assume WebAssembly which results in more reliable and predictable results for this module.

### Large Sourcemap

few runs (10): this module is 150x faster than `source-map`.
a lot of runs (1000): this module is the same speed as `source-map`.

### Small Sourcemap

few runs (10): this module is 200x faster than `source-map`.
a lot of runs (1000): this module is 10x faster than `source-map`.

## State

- [x] Be able to parse mappings
- [x] Be able to parse full source-map
- [x] Be able to append mappings
- [ ] Be able to compile mappings
- [ ] Be able to compile full source-map
- [ ] Build a mappings tree for fast manipulations
- [ ] Be able to insert mappings
- [ ] Be able to query mappings by generated location
- [ ] Be able to query mappings by original location
- [ ] Be able to merge source maps
- [ ] More features?
