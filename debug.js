// For debugging issues write minimal reproduction here...
const SourceMap = require('./').default;
const assert = require('assert');

const SIMPLE_SOURCE_MAP = {
  version: 3,
  file: 'helloworld.js',
  sources: ['helloworld.coffee'],
  names: [],
  mappings: 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA',
};

async function run() {
  let originalMap = new SourceMap('/test-root');
  originalMap.addIndexedMappings([
    {
      source: 'index.js',
      name: 'A',
      original: {
        line: 1,
        column: 0,
      },
      generated: {
        line: 6,
        column: 15,
      },
    },
  ]);

  let newMap = new SourceMap('/test-root');
  newMap.addIndexedMappings([
    {
      source: 'index.js',
      name: 'B',
      original: {
        line: 6,
        column: 15,
      },
      generated: {
        line: 5,
        column: 12,
      },
    },
  ]);

  newMap.extends(originalMap.toBuffer());

  let mappings = newMap.getMap().mappings;

  assert.equal(mappings.length, 1);
  assert.deepEqual(mappings[0], {
    source: 0,
    name: 1,
    original: {
      line: 1,
      column: 0,
    },
    generated: {
      line: 5,
      column: 12,
    },
  });

  let stringifiedMap = JSON.parse(
    await newMap.stringify({
      file: 'index.js.map',
      sourceRoot: '/',
    })
  );

  assert.deepEqual(stringifiedMap, {
    version: 3,
    file: 'index.js.map',
    sourceRoot: '/',
    sources: ['index.js'],
    sourcesContent: [null],
    names: ['B', 'A'],
    mappings: ';;;;YAAAC',
  });
}

run().catch((err) => {
  console.error(err);
});
