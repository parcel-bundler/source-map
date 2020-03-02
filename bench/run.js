const ParcelSourceMap = require("./parcel-source-map").default;
const Benchmark = require("tiny-benchy");
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

suite.add("@parcel/source-map#consume", async () => {
  for (let map of test_maps) {
    let sm = await ParcelSourceMap.fromRawSourceMap(map);
  }
});

suite.add("@parcel/source-map#consume->serialize->JSON.stringify", async () => {
  for (let map of test_maps) {
    let sm = await ParcelSourceMap.fromRawSourceMap(map);
    JSON.stringify(sm.serialize());
  }
});

suite.add("cpp#consume", async () => {
  for (let map of test_maps) {
    new SourceMap(map.mappings, map.sources.length, map.names.length);
  }
});

suite.add("cpp#consume->toString", async () => {
  for (let map of test_maps) {
    let sm = new SourceMap(map.mappings, map.sources.length, map.names.length);
    sm.toString();
  }
});

suite.add("cpp#consume->toBuffer", async () => {
  for (let map of test_maps) {
    let sm = new SourceMap(map.mappings, map.sources.length, map.names.length);
    sm.toBuffer();
  }
});

suite.run();

let sm = new SourceMap(test_maps[0].mappings, test_maps[0].sources.length, test_maps[0].sources.length);
console.log(test_maps[0].mappings);
console.log(sm.toString());
console.log(sm.toBuffer());
