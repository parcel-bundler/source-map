const Benchmark = require("tiny-benchy");
const assert = require("assert");
const SourceMap = require("../");

const ITERATIONS = 50;

const test_maps = [
  {
    version: 3,
    file: "helloworld.js",
    sources: ["helloworld.coffee"],
    names: [],
    mappings: "AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA"
  },
  require("./maps/angular")
];
const suite = new Benchmark(ITERATIONS);

let mappings = new Array(100).fill("").map((item, index) => {
  return {
    source: "index.js",
    name: "A",
    original: {
      line: index,
      column: 0 + 10 * index
    },
    generated: {
      line: 1,
      column: 15 + 10 * index
    }
  };
});

let sourcemapInstance = new SourceMap();
let sourcemapBuffer = sourcemapInstance.toBuffer();
let rawSourceMap;
// This isn't actually a safe operation but by the time the benchmark needs this it'll be ready (I guess)
(async () => {
  rawSourceMap = JSON.parse(
    await sourcemapInstance.stringify({
      file: "index.js.map",
      sourceRoot: "/"
    })
  );
})();

suite.add("consume vlq mappings", async () => {
  for (let testMap of test_maps) {
    let map = new SourceMap();
    map.addRawMappings(testMap.mappings, testMap.sources, testMap.names);
  }
});

suite.add("consume vlq mappings and stringify outputmap", async () => {
  for (let testMap of test_maps) {
    let map = new SourceMap();
    map.addRawMappings(testMap.mappings, testMap.sources, testMap.names);
    await map.stringify({
      file: "index.js.map",
      sourceRoot: "/"
    });
  }
});

suite.add("convert vlq mappings to buffer", async () => {
  for (let testMap of test_maps) {
    let map = new SourceMap();
    map.addRawMappings(testMap.mappings, testMap.sources, testMap.names);
    let buff = map.toBuffer();
  }
});

suite.add("combine 1000 maps using JS Mappings", async () => {
  let map = new SourceMap();
  for (let i = 0; i < 1000; i++) {
    map.addIndexedMappings(mappings, i * 4);
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

suite.add("combine 1000 maps using flatbuffers", async () => {
  let map = new SourceMap();
  for (let i = 0; i < 1000; i++) {
    map.addBufferMappings(sourcemapBuffer, i * 4);
  }
});

suite.add("combine 1000 maps using flatbuffers and convert to buffer", async () => {
  let map = new SourceMap();
  for (let i = 0; i < 1000; i++) {
    map.addBufferMappings(sourcemapBuffer, i * 4);
  }
  map.toBuffer();
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
