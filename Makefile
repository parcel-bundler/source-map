CC=emcc
CXX=em++

CPPFLAGS=-Isrc
CFLAGS=-Oz -flto
CXXFLAGS=-Oz -flto
LDFLAGS=-s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s FILESYSTEM=0 --bind \
	-Oz -flto -s ASSERTIONS=0 -flto --llvm-lto 1 -Oz --closure 1

LDFLAGS_BROWSER=-s ENVIRONMENT="web,worker"
LDFLAGS_NODE=-s ENVIRONMENT="node"

.PHONY:all
all: wasm-browser/source-map.js wasm-node/source-map.js

wasm-browser/source-map.js: src/wasm/SourceMap.o src/MappingContainer.o src/MappingLine.o src/Mapping.o
	mkdir -p wasm-browser
	$(CXX) -o $@ $? $(LDFLAGS) $(LDFLAGS_BROWSER)

wasm-node/source-map.js: src/wasm/SourceMap.o src/MappingContainer.o src/MappingLine.o src/Mapping.o
	mkdir -p wasm-node
	$(CXX) -o $@ $? $(LDFLAGS) $(LDFLAGS_NODE)

.PHONY: clean
clean:
	rm -f src/*.o src/*/*.o wasm/*
