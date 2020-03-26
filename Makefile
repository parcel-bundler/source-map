CC=emcc
CXX=em++

CPPFLAGS=-Isrc
CFLAGS=-Oz -flto
CXXFLAGS=-Oz -flto
LDFLAGS=-Oz -flto -s ASSERTIONS=0 -flto --llvm-lto 1 -Oz --closure 1 \
	-s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s FILESYSTEM=0 --bind

wasm/index.js: src/wasm/SourceMap.o src/MappingContainer.o src/MappingLine.o src/Mapping.o
	mkdir -p wasm
	$(CXX) -o $@ $? $(LDFLAGS)

.PHONY: clean
clean:
	rm -f src/*.o src/*/*.o wasm/*
