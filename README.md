# Parcel's source-map library

A purpose build source-maps library for combining and manipulating source-maps.

For just reading source-maps, this library does not outperform the probably more stable and well-known package `source-map` by Mozilla.

## Why did we write this library

Parcel is a performance concious bundler, and therefore we like to optimise Parcel's performance as much as possible.

Our original source-map implementation used mozilla's source-map and a bunch of javascript and had issues with memory usage and serialisation times (we were keeping all mappings in memory using JS objects and write/read it using JSON for caching).

This implementation has been written from scratch in C++ minimizing the memory usage, by utilising indexes for sources and names and optimising serialisation times by using flatbuffers instead of JSON for caching.

## Compile flatbuffer schema

```bash
cd ./src && ../flatc --cpp ./sourcemap-schema.fbs && cd ..
```
