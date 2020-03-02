const ParcelSourceMap = require("./parcel-source-map").default;
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

suite.add(
  "@parcel/source-map#consume->serialize->JSON.stringify->JSON.parse->new SourceMap",
  async () => {
    for (let map of test_maps) {
      let sm = await ParcelSourceMap.fromRawSourceMap(map);
      let parsed = JSON.parse(JSON.stringify(sm.serialize()));
      sm = new ParcelSourceMap(map);
    }
  }
);

suite.add("cpp#consume", async () => {
  for (let map of test_maps) {
    let sm = new SourceMap(map.mappings, map.sources.length, map.names.length);
  }
});

suite.add("cpp#consume->toString", async () => {
  for (let map of test_maps) {
    let sm = new SourceMap(map.mappings, map.sources.length, map.names.length);
    let s = sm.toString();
  }
});

suite.add("cpp#consume->toBuffer", async () => {
  for (let map of test_maps) {
    let sm = new SourceMap(map.mappings, map.sources.length, map.names.length);
    let buff = sm.toBuffer();
  }
});

suite.add("cpp#consume->toBuffer->fromBuffer", async () => {
  for (let map of test_maps) {
    let sm = new SourceMap(map.mappings, map.sources.length, map.names.length);
    let buff = sm.toBuffer();
  }
});

// suite.run();

let sm = new SourceMap(
  test_maps[0].mappings,
  test_maps[0].sources.length,
  test_maps[0].names.length
);
console.log(test_maps[0].mappings);
let s = sm.toString();
console.log(s);
let buff = sm.toBuffer();
console.log(buff);
let resurrectedSourcemap = new SourceMap(buff);
console.log(resurrectedSourcemap.toString());
// assert.equal(s, resurrectedSourcemap.toString());
