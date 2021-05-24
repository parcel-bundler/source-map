import assert from 'assert';
import SourceMap from '.';

const SIMPLE_SOURCE_MAP = {
  version: 3,
  file: 'helloworld.js',
  sources: ['./helloworld.coffee'],
  names: [],
  mappings: 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA',
};

let expectedResultOne = {
  sources: ['helloworld.coffee'],
  sourcesContent: [''],
  names: [],
  mappings: [
    {
      generated: { line: 1, column: 0 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 2, column: 0 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 2, column: 2 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 2, column: 9 },
      original: { line: 1, column: 7 },
      source: 0,
    },
    {
      generated: { line: 2, column: 10 },
      original: { line: 1, column: 8 },
      source: 0,
    },
    {
      generated: { line: 2, column: 13 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 2, column: 14 },
      original: { line: 1, column: 12 },
      source: 0,
    },
    {
      generated: { line: 2, column: 27 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 2, column: 28 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 2, column: 29 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 3, column: 0 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 11, column: 0 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 12, column: 0 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 12, column: 2 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 12, column: 9 },
      original: { line: 1, column: 7 },
      source: 0,
    },
    {
      generated: { line: 12, column: 10 },
      original: { line: 1, column: 8 },
      source: 0,
    },
    {
      generated: { line: 12, column: 13 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 12, column: 14 },
      original: { line: 1, column: 12 },
      source: 0,
    },
    {
      generated: { line: 12, column: 27 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 12, column: 28 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 12, column: 29 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 13, column: 0 },
      original: { line: 1, column: 0 },
      source: 0,
    },
  ],
};

let expectedResultTwo = {
  sources: ['helloworld.coffee'],
  sourcesContent: [''],
  names: [],
  mappings: [
    {
      generated: { line: 1, column: 0 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 2, column: 0 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 2, column: 2 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 2, column: 9 },
      original: { line: 1, column: 7 },
      source: 0,
    },
    {
      generated: { line: 2, column: 10 },
      original: { line: 1, column: 8 },
      source: 0,
    },
    {
      generated: { line: 2, column: 13 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 2, column: 14 },
      original: { line: 1, column: 12 },
      source: 0,
    },
    {
      generated: { line: 2, column: 27 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 2, column: 28 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 2, column: 29 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 3, column: 0 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 11, column: 46 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 12, column: 46 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 12, column: 48 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 12, column: 55 },
      original: { line: 1, column: 7 },
      source: 0,
    },
    {
      generated: { line: 12, column: 56 },
      original: { line: 1, column: 8 },
      source: 0,
    },
    {
      generated: { line: 12, column: 59 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 12, column: 60 },
      original: { line: 1, column: 12 },
      source: 0,
    },
    {
      generated: { line: 12, column: 73 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 12, column: 74 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 12, column: 75 },
      original: { line: 1, column: 0 },
      source: 0,
    },
    {
      generated: { line: 13, column: 46 },
      original: { line: 1, column: 0 },
      source: 0,
    },
  ],
};

describe('SourceMap - Append Mappings', () => {
  it('Append buffer mappings with line offset', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });
    let buffer = map.toBuffer();
    map.addBuffer(buffer, 10);
    assert.deepEqual(map.getMap(), expectedResultOne);
  });

  it('Append source map with line offset', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });
    let map2 = new SourceMap(map.toBuffer());
    map.addSourceMap(map2, 10);
    assert.deepEqual(map.getMap(), expectedResultOne);
    // map2 is consumed
    assert.equal(map2.getMappings().length, 0);
  });

  it('Append buffer mappings with sourceContent', () => {
    let originalMap = new SourceMap('/test-root');
    originalMap.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
      sourcesContent: ['a-content'],
    });
    let buffer = originalMap.toBuffer();

    let newMap = new SourceMap('/test-root');
    newMap.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });
    newMap.addBuffer(buffer, 10);
    assert.deepEqual(newMap.getMap(), {
      ...expectedResultOne,
      sourcesContent: ['a-content'],
    });
  });

  it('Append vlq mappings with line offset', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });
    map.addVLQMap(
      {
        mappings: SIMPLE_SOURCE_MAP.mappings,
        sources: SIMPLE_SOURCE_MAP.sources,
        names: SIMPLE_SOURCE_MAP.names,
      },
      10
    );
    assert.deepEqual(map.getMap(), expectedResultOne);
  });

  it('Append vlq mappings with line and column offset', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });
    map.addVLQMap(
      {
        mappings: SIMPLE_SOURCE_MAP.mappings,
        sources: SIMPLE_SOURCE_MAP.sources,
        names: SIMPLE_SOURCE_MAP.names,
      },
      10,
      46
    );
    assert.deepEqual(map.getMap(), expectedResultTwo);
  });

  it('Merge map with null mappings', async () => {
    const MAP_OFFSET = 24;
    let map = new SourceMap('/test-root');

    map.addIndexedMappings([
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
      {
        generated: {
          line: 12,
          column: 6,
        },
      },
    ]);

    map.addIndexedMappings(
      [
        {
          source: 'local.js',
          name: 'T',
          original: {
            line: 1,
            column: 0,
          },
          generated: {
            line: 12,
            column: 6,
          },
        },
        {
          source: 'local.js',
          name: 'Q',
          original: {
            line: 1,
            column: 0,
          },
          generated: {
            line: 111,
            column: 65,
          },
        },
        {
          generated: {
            line: 152,
            column: 23,
          },
        },
      ],
      MAP_OFFSET
    );

    let mappings = map.getMap().mappings;

    assert.equal(mappings.length, 5);

    // Map One
    assert.deepEqual(mappings[0], {
      source: 0,
      name: 0,
      original: {
        line: 1,
        column: 0,
      },
      generated: {
        line: 6,
        column: 15,
      },
    });

    assert.deepEqual(mappings[1], {
      generated: {
        line: 12,
        column: 6,
      },
    });

    // Map Two
    assert.deepEqual(mappings[2], {
      source: 1,
      name: 1,
      original: {
        line: 1,
        column: 0,
      },
      generated: {
        line: 12 + MAP_OFFSET,
        column: 6,
      },
    });

    assert.deepEqual(mappings[3], {
      source: 1,
      name: 2,
      original: {
        line: 1,
        column: 0,
      },
      generated: {
        line: 111 + MAP_OFFSET,
        column: 65,
      },
    });

    assert.deepEqual(mappings[4], {
      generated: {
        line: 152 + MAP_OFFSET,
        column: 23,
      },
    });

    let stringifiedMap = JSON.parse(
      await map.stringify({
        file: 'index.js.map',
        sourceRoot: '/',
      })
    );
    assert.deepEqual(stringifiedMap, {
      version: 3,
      file: 'index.js.map',
      sourceRoot: '/',
      sources: ['index.js', 'local.js'],
      sourcesContent: [null, null],
      names: ['A', 'T', 'Q'],
      mappings:
        ';;;;;eAAAA;;;;;;M;;;;;;;;;;;;;;;;;;;;;;;;MCAAC;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;iEAAAC;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;uB',
    });
  });

  it('Should be able to handle all variations of indexedmappings', async () => {
    let map = new SourceMap('/test-root');

    map.addIndexedMappings([
      {
        source: 'test.js',
        generated: {
          line: 4,
          column: 15,
        },
      },
      {
        source: 'test.js',
        original: {
          line: 1,
          column: 0,
        },
        generated: {
          line: 5,
          column: 15,
        },
      },
      {
        name: 'test',
        source: 'test.js',
        original: {
          line: 2,
          column: 0,
        },
        generated: {
          line: 6,
          column: 15,
        },
      },
      {
        name: null,
        source: 'test.js',
        original: {
          line: 3,
          column: 0,
        },
        generated: {
          line: 7,
          column: 15,
        },
      },
      {
        source: null,
        original: null,
        generated: {
          line: 8,
          column: 15,
        },
      },
      {
        name: null,
        source: 'test.js',
        original: {},
        generated: {
          line: 9,
          column: 15,
        },
      },
      {
        original: {
          line: 3,
          column: 0,
        },
        generated: {
          line: 10,
          column: 15,
        },
      },
    ]);

    let mappings = map.getMap().mappings;
    assert.equal(mappings.length, 7);

    // Validate mappings
    assert.deepEqual(mappings[0], {
      generated: {
        line: 4,
        column: 15,
      },
    });
    assert.deepEqual(mappings[1], {
      source: 0,
      original: {
        line: 1,
        column: 0,
      },
      generated: {
        line: 5,
        column: 15,
      },
    });
    assert.deepEqual(mappings[2], {
      name: 0,
      source: 0,
      original: {
        line: 2,
        column: 0,
      },
      generated: {
        line: 6,
        column: 15,
      },
    });
    assert.deepEqual(mappings[3], {
      source: 0,
      original: {
        line: 3,
        column: 0,
      },
      generated: {
        line: 7,
        column: 15,
      },
    });
    assert.deepEqual(mappings[4], {
      generated: {
        line: 8,
        column: 15,
      },
    });
  });
});
