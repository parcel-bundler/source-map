# Source Maps

This module is a very early work in progress, which has as end goal to allow lightning fast parsing, compiling and manipulation of sourcemaps, while being able to stringify and parse to a minimal footprint. As well as the ability to save maps as buffers for better caching performance in tools. (in constrast to storing the entire structure as json or vlq's)

## Compile flatbuffer schema

```bash
cd ./src && ../flatc --cpp ./sourcemap-schema.fbs && cd ..
```
