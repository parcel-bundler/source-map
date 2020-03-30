const assert = require("assert");
const SourceMap = require(".").default;

const SIMPLE_SOURCE_MAP = {
  version: 3,
  file: "helloworld.js",
  sources: ["helloworld.coffee"],
  names: [],
  mappings: "AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA"
};

describe("SourceMap - Basics", () => {
  it("Should be able to instantiate a SourceMap with vlq mappings", async () => {
    let map = new SourceMap();
    map.addRawMappings(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );
    let stringifiedMap = JSON.parse(
      await map.stringify({
        file: "index.js.map",
        sourceRoot: "/"
      })
    );
    assert.equal(stringifiedMap.mappings, SIMPLE_SOURCE_MAP.mappings);
  });

  it("Should be able to output the processed mappings as JS Objects", () => {
    let map = new SourceMap();
    map.addRawMappings(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );

    assert.deepEqual(map.getMap(), {
      sources: ["helloworld.coffee"],
      names: [],
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 },
          source: 0
        },
        {
          generated: { line: 2, column: 0 },
          original: { line: 1, column: 0 },
          source: 0
        },
        {
          generated: { line: 2, column: 2 },
          original: { line: 1, column: 0 },
          source: 0
        },
        {
          generated: { line: 2, column: 9 },
          original: { line: 1, column: 7 },
          source: 0
        },
        {
          generated: { line: 2, column: 10 },
          original: { line: 1, column: 8 },
          source: 0
        },
        {
          generated: { line: 2, column: 13 },
          original: { line: 1, column: 0 },
          source: 0
        },
        {
          generated: { line: 2, column: 14 },
          original: { line: 1, column: 12 },
          source: 0
        },
        {
          generated: { line: 2, column: 27 },
          original: { line: 1, column: 0 },
          source: 0
        },
        {
          generated: { line: 2, column: 28 },
          original: { line: 1, column: 0 },
          source: 0
        },
        {
          generated: { line: 2, column: 29 },
          original: { line: 1, column: 0 },
          source: 0
        },
        {
          generated: { line: 3, column: 0 },
          original: { line: 1, column: 0 },
          source: 0
        }
      ]
    });
  });

  it("Should be able to instantiate a SourceMap with processed mappings", async () => {
    let map = new SourceMap();

    map.addIndexedMappings([
      {
        source: "index.js",
        name: "A",
        original: {
          line: 1,
          column: 0
        },
        generated: {
          line: 6,
          column: 15
        }
      }
    ]);

    let stringifiedMap = JSON.parse(
      await map.stringify({
        file: "index.js.map",
        sourceRoot: "/"
      })
    );
    assert.deepEqual(stringifiedMap, {
      version: 3,
      file: "index.js.map",
      sourceRoot: "/",
      mappings: ";;;;;eAAAA",
      sources: ["index.js"],
      names: ["A"]
    });
  });

  it("Should be able to handle undefined name field using addIndexedMappings", async () => {
    let map = new SourceMap();

    map.addIndexedMappings([
      {
        source: "index.js",
        name: undefined,
        original: {
          line: 1,
          column: 0
        },
        generated: {
          line: 6,
          column: 15
        }
      }
    ]);

    let stringifiedMap = JSON.parse(
      await map.stringify({
        file: "index.js.map",
        sourceRoot: "/"
      })
    );
    assert.deepEqual(stringifiedMap, {
      version: 3,
      file: "index.js.map",
      sourceRoot: "/",
      mappings: ";;;;;eAAA",
      sources: ["index.js"],
      names: []
    });
  });

  it("Should be able to handle undefined name and source field using addIndexedMappings", async () => {
    let map = new SourceMap();

    map.addIndexedMappings([
      {
        source: undefined,
        name: undefined,
        original: undefined,
        generated: {
          line: 6,
          column: 15
        }
      }
    ]);

    let stringifiedMap = JSON.parse(
      await map.stringify({
        file: "index.js.map",
        sourceRoot: "/"
      })
    );
    assert.deepEqual(stringifiedMap, {
      version: 3,
      file: "index.js.map",
      sourceRoot: "/",
      mappings: ";;;;;e",
      sources: [],
      names: []
    });
  });

  it("Should be able to create a SourceMap buffer and construct a new SourceMap from it", async () => {
    let map = new SourceMap();
    map.addRawMappings(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );
    let buffer = map.toBuffer();
    let newMap = new SourceMap();
    newMap.addBufferMappings(buffer);
    let stringifiedMap = JSON.parse(
      await newMap.stringify({
        file: "index.js.map",
        sourceRoot: "/"
      })
    );
    assert.equal(stringifiedMap.mappings, SIMPLE_SOURCE_MAP.mappings);
  });

  it("Should be able to add sources to a sourcemap", () => {
    let map = new SourceMap();
    map.addRawMappings(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );

    assert.deepEqual(map.addSources(["index.js"]), [1]);
    assert.deepEqual(map.addSources(["test.js", "execute.js"]), [2, 3]);
  });

  it("Should be able to add names to a sourcemap", () => {
    let map = new SourceMap();
    map.addRawMappings(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );

    assert.deepEqual(map.addNames(["run"]), [0]);
    assert.deepEqual(map.addNames(["processQueue", "processNode"]), [1, 2]);
  });

  it("Should be able to return source index", () => {
    let map = new SourceMap();
    map.addRawMappings(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );

    map.addSources(["test.ts"]);
    assert.equal(map.getSourceIndex("helloworld.coffee"), 0);
    assert.equal(map.getSourceIndex("e.coffee"), -1);
    assert.equal(map.getSourceIndex("test.ts"), 1);
  });

  it("Should be able to return name index", () => {
    let map = new SourceMap();
    map.addRawMappings(
      SIMPLE_SOURCE_MAP.mappings,
      SIMPLE_SOURCE_MAP.sources,
      SIMPLE_SOURCE_MAP.names
    );

    map.addNames(["test"]);
    assert.equal(map.getNameIndex("test"), 0);
    assert.equal(map.getNameIndex("something"), -1);
  });
});
