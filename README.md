# Source Maps

This module is a very early work in progress, which has as end goal to allow lightning fast parsing, compiling and manipulation of sourcemaps, while being able to stringify and parse to a minimal footprint. As well as the ability to save maps as buffers for better caching performance in tools. (in constrast to storing the entire structure as json or vlq's)

## State

- [x] Parse VLQ mappings
- [x] Parse full source-map
- [x] Compile mappings
- [x] Compile full source-map
- [x] Be able to add sourcemaps
- [x] Serialise sourcemap to buffer
- [x] Parse sourcemap from buffer
- [ ] Store names and sources string values in cpp
- [ ] Sorting
- [ ] Add ability to get a sorted parsed map (non-vlq encoded mappings)
- [ ] Create a queue for sorting that runs using background threads?
- [ ] Query mappings by generated location
- [ ] Query mappings by original location

## Compile flatbuffer schema

```bash
cd ./src && ../flatc --cpp ./sourcemap-schema.fbs && cd ..
```
