# Source Maps

This module is a very early work in progress, which has as end goal to allow lightning fast parsing, compiling and manipulation of sourcemaps, while being able to stringify and parse to a minimal footprint.

Mozilla's SourceMap module already handles most of this and this module is heavily based and inspired by the sourcemaps module, however this is one class to do everything, consuming, generating and modifying entirely written in cpp. Which should result in less overhead and faster sourcemap `read -> manipulate -> generate` and `read -> generate` operations.

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
