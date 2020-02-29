# Source Maps

This module is a very early work in progress, which has as end goal to allow lightning fast parsing, compiling and manipulation of sourcemaps, while being able to stringify and parse to a minimal footprint.

Mozilla's SourceMap module already handles most of this and this module is heavily based and inspired by the sourcemaps module, but is a complete rewrite in cpp to hopefully allow lightning fast manipulations.

## State

- [x] Be able to parse mappings
- [ ] Be able to parse full source-map
- [ ] Be able to compile mappings
- [ ] Be able to compile full source-map
- [ ] Build a mappings tree for fast manipulations
- [ ] Be able to append mappings
- [ ] Be able to insert mappings
- [ ] Be able to query mappings by generated location
- [ ] Be able to query mappings by original location
- [ ] Be able to merge source maps
- [ ] More features?
