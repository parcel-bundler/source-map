const assert = require("assert");
const SourceMap = require("../").default;

describe("SourceMap - Find", () => {
  it("Should be able to find closest mapping to a generated position", async () => {
    let map = new SourceMap();
    map.addRawMappings(
      "AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA",
      ["helloworld.coffee"],
      []
    );

    let mapping = map.findClosestMapping(2, 14);
    assert.deepEqual(mapping, {
      generated: { line: 2, column: 14 },
      original: { line: 1, column: 12 },
      source: 0
    });

    mapping = map.findClosestMapping(2, 12);
    assert.deepEqual(mapping, {
      generated: { line: 2, column: 13 },
      original: { line: 1, column: 0 },
      source: 0
    });
  });
});
