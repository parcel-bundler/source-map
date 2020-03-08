const Benchmark = require("tiny-benchy");
const assert = require("assert");
const SourceMap = require("../");

const ITERATIONS = 250;

const suite = new Benchmark(ITERATIONS);

let mappings = new Array(100).fill("").map((item, index) => {
  return {
    source: "index.js",
    name: "A",
    original: {
      line: index + 1,
      column: 0 + 10 * index
    },
    generated: {
      line: 1,
      column: 15 + 10 * index
    }
  };
});

let sourcemapInstance = new SourceMap();
sourcemapInstance.addIndexedMappings(mappings);
let sourcemapBuffer = sourcemapInstance.toBuffer();
let rawSourceMap = sourcemapInstance.toVLQ();

suite.add("consume vlq mappings", async () => {
  let map = new SourceMap();
  map.addRawMappings(
    rawSourceMap.mappings,
    rawSourceMap.sources,
    rawSourceMap.names
  );
});

suite.add("consume flatbuffer", async () => {
  let map = new SourceMap();
  map.addBufferMappings(sourcemapBuffer);
});

suite.add("consume JS Mappings", async () => {
  let map = new SourceMap();
  map.addIndexedMappings(mappings);
});

suite.add("Save buffer", async () => {
  sourcemapInstance.toBuffer();
});

suite.add("extend map", async () => {
  let map = new SourceMap();
  map.addBufferMappings(sourcemapBuffer);
  map.extends(sourcemapBuffer);
});

suite.add("stringify", async () => {
  await sourcemapInstance.stringify({
    file: "index.js.map",
    sourceRoot: "/"
  });
});

suite.add("combine 1000 maps using flatbuffers", async () => {
  let map = new SourceMap();
  for (let i = 0; i < 1000; i++) {
    map.addBufferMappings(sourcemapBuffer, i * 4);
  }
});

suite.add("combine 1000 maps using vlq mappings", async () => {
  let map = new SourceMap();
  for (let i = 0; i < 1000; i++) {
    map.addRawMappings(
      rawSourceMap.mappings,
      rawSourceMap.sources,
      rawSourceMap.names,
      i * 4
    );
  }
});

suite.add("combine 1000 maps using flatbuffers and stringify", async () => {
  let map = new SourceMap();
  for (let i = 0; i < 1000; i++) {
    map.addBufferMappings(sourcemapBuffer, i * 4);
  }
  await map.stringify({
    file: "index.js.map",
    sourceRoot: "/"
  });
});

suite.run();
