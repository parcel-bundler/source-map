const assert = require("assert");
const SourceMap = require("../");

const SIMPLE_SOURCE_MAP = {
  version: 3,
  file: "helloworld.js",
  sources: ["helloworld.coffee"],
  names: [],
  mappings: "AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA"
};

describe("SourceMap - Append Mappings", () => {
  it("Append buffer mappings with line offset", () => {
    let sm = new SourceMap(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );
    let buffer = sm.toBuffer();
    sm.addBufferMappings(buffer, 10);

    let expectedRes = {
      sources: ["helloworld.coffee", "helloworld.coffee"],
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
        },
        {
          generated: { line: 10, column: 0 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 11, column: 0 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 11, column: 2 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 11, column: 9 },
          original: { line: 7, column: 7 },
          source: 1
        },
        {
          generated: { line: 11, column: 10 },
          original: { line: 8, column: 8 },
          source: 1
        },
        {
          generated: { line: 11, column: 13 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 11, column: 14 },
          original: { line: 12, column: 12 },
          source: 1
        },
        {
          generated: { line: 11, column: 27 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 11, column: 28 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 11, column: 29 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 12, column: 0 },
          original: { line: 0, column: 0 },
          source: 1
        }
      ]
    };

    assert.deepEqual(sm.getMap(), expectedRes);
  });

  it("Append buffer mappings with line and column offset", () => {
    let sm = new SourceMap(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );
    let buffer = sm.toBuffer();
    sm.addBufferMappings(buffer, 10, 46);

    let expectedRes = {
      sources: ["helloworld.coffee", "helloworld.coffee"],
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
        },
        {
          generated: { line: 10, column: 46 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 11, column: 46 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 11, column: 48 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 11, column: 55 },
          original: { line: 7, column: 7 },
          source: 1
        },
        {
          generated: { line: 11, column: 56 },
          original: { line: 8, column: 8 },
          source: 1
        },
        {
          generated: { line: 11, column: 59 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 11, column: 60 },
          original: { line: 12, column: 12 },
          source: 1
        },
        {
          generated: { line: 11, column: 73 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 11, column: 74 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 11, column: 75 },
          original: { line: 0, column: 0 },
          source: 1
        },
        {
          generated: { line: 12, column: 46 },
          original: { line: 0, column: 0 },
          source: 1
        }
      ]
    };

    assert.deepEqual(sm.getMap(), expectedRes);
  });
});
