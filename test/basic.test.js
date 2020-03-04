const assert = require("assert");
const SourceMap = require("../");

const SIMPLE_SOURCE_MAP = {
  version: 3,
  file: "helloworld.js",
  sources: ["helloworld.coffee"],
  names: [],
  mappings: "AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA"
};

describe("SourceMap - Basics", () => {
  it("Should be able to instantiate a SourceMap with vlq mappings", () => {
    let sm = new SourceMap(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );
    let s = sm.stringify();
    assert.equal(s.mappings, SIMPLE_SOURCE_MAP.mappings);
  });

  it("Should be able to output the processed mappings as JS Objects", () => {
    let sm = new SourceMap(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );

    assert.deepEqual(sm.getMap(), {
      sources: ["helloworld.coffee"],
      names: [],
      mappings: [
        {
          generated: { line: 0, column: 0 },
          original: { line: 0, column: 0 },
          source: 0
        },
        {
          generated: { line: 1, column: 0 },
          original: { line: 0, column: 0 },
          source: 0
        },
        {
          generated: { line: 1, column: 2 },
          original: { line: 0, column: 0 },
          source: 0
        },
        {
          generated: { line: 1, column: 9 },
          original: { line: 7, column: 7 },
          source: 0
        },
        {
          generated: { line: 1, column: 10 },
          original: { line: 8, column: 8 },
          source: 0
        },
        {
          generated: { line: 1, column: 13 },
          original: { line: 0, column: 0 },
          source: 0
        },
        {
          generated: { line: 1, column: 14 },
          original: { line: 12, column: 12 },
          source: 0
        },
        {
          generated: { line: 1, column: 27 },
          original: { line: 0, column: 0 },
          source: 0
        },
        {
          generated: { line: 1, column: 28 },
          original: { line: 0, column: 0 },
          source: 0
        },
        {
          generated: { line: 1, column: 29 },
          original: { line: 0, column: 0 },
          source: 0
        },
        {
          generated: { line: 2, column: 0 },
          original: { line: 0, column: 0 },
          source: 0
        }
      ]
    });
  });

  it.skip("Should be able to instantiate a SourceMap with processed mappings", () => {
    // TODO: Write this functionality...
  });

  it("Should be able to create a SourceMap buffer and construct a new SourceMap from it", () => {
    let sm = new SourceMap(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );
    let buffer = sm.toBuffer();
    let newMap = new SourceMap(buffer);
    let s = newMap.stringify();
    assert.equal(s.mappings, SIMPLE_SOURCE_MAP.mappings);
  });

  it("Should be able to add sources to a sourcemap", () => {
    let sm = new SourceMap(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );

    assert.deepEqual(sm.addSources(["index.js"]), [1]);
    assert.deepEqual(sm.addSources(["test.js", "execute.js"]), [2, 3]);
  });

  it("Should be able to add names to a sourcemap", () => {
    let sm = new SourceMap(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );

    assert.deepEqual(sm.addNames(["run"]), [0]);
    assert.deepEqual(sm.addNames(["processQueue", "processNode"]), [1, 2]);
  });
});
