const assert = require("assert");
const SourceMap = require("../");

describe("SourceMap - Empty Map", () => {
  it("Should be able to create a 1 to 1 map from a sourcefile", async () => {
    let map = SourceMap.generateEmptyMap(
      "index.js",
      `
      function test() {
        return "hello world!";
      }
    `
    );

    let mapContent = map.getMap();
    assert.deepEqual(mapContent, {
      sources: ["index.js"],
      names: [],
      mappings: [
        {
          generated: { line: 0, column: 0 },
          original: { line: 0, column: 0 },
          source: 0
        },
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 },
          source: 0
        },
        {
          generated: { line: 2, column: 0 },
          original: { line: 2, column: 0 },
          source: 0
        },
        {
          generated: { line: 3, column: 0 },
          original: { line: 3, column: 0 },
          source: 0
        }
      ]
    });
  });

  it("Should be able to create a 1 to 1 map from a sourcefile with a lineOffset", async () => {
    let map = SourceMap.generateEmptyMap(
      "index.js",
      `
      function test() {
        return "hello world!";
      }
    `, 10
    );

    let mapContent = map.getMap();
    assert.deepEqual(mapContent, {
      sources: ["index.js"],
      names: [],
      mappings: [
        {
          generated: { line: 10, column: 0 },
          original: { line: 10, column: 0 },
          source: 0
        },
        {
          generated: { line: 11, column: 0 },
          original: { line: 11, column: 0 },
          source: 0
        },
        {
          generated: { line: 12, column: 0 },
          original: { line: 12, column: 0 },
          source: 0
        },
        {
          generated: { line: 13, column: 0 },
          original: { line: 13, column: 0 },
          source: 0
        }
      ]
    });
  });
});
