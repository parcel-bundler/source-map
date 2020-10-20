import assert from 'assert';
import SourceMap from '.';

const SIMPLE_SOURCE_MAP = {
  version: 3,
  file: 'helloworld.js',
  sources: ['helloworld.coffee'],
  names: [],
  mappings: 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA',
};

describe('SourceMap - Offset Utils', () => {
  it('Should be able to offset columns', () => {
    let map = new SourceMap('/test-root');

    map.addRawMappings({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    map.offsetColumns(1, 0, 2);

    map.offsetColumns(2, 15, -4);

    assert.deepEqual(map.getMap(), {
      sources: ['./helloworld.coffee'],
      sourcesContent: [''],
      names: [],
      mappings: [
        {
          generated: { line: 1, column: 2 },
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
          generated: { line: 2, column: 23 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 2, column: 24 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 2, column: 25 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 3, column: 0 },
          original: { line: 1, column: 0 },
          source: 0,
        },
      ],
    });
  });

  it('Column offset empty map', () => {
    let map = new SourceMap('/');

    map.offsetColumns(1, 0, 2);
    map.offsetColumns(2, 15, -4);

    assert.deepEqual(map.getMap(), {
      sources: [],
      sourcesContent: [],
      names: [],
      mappings: [],
    });
  });

  it('Positive line offset', () => {
    let map = new SourceMap('/test-root');

    map.addRawMappings({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    map.offsetLines(1, 2);

    assert.deepEqual(map.getMap(), {
      sources: ['./helloworld.coffee'],
      sourcesContent: [''],
      names: [],
      mappings: [
        {
          generated: { line: 3, column: 0 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 4, column: 0 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 4, column: 2 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 4, column: 9 },
          original: { line: 1, column: 7 },
          source: 0,
        },
        {
          generated: { line: 4, column: 10 },
          original: { line: 1, column: 8 },
          source: 0,
        },
        {
          generated: { line: 4, column: 13 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 4, column: 14 },
          original: { line: 1, column: 12 },
          source: 0,
        },
        {
          generated: { line: 4, column: 27 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 4, column: 28 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 4, column: 29 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 5, column: 0 },
          original: { line: 1, column: 0 },
          source: 0,
        },
      ],
    });
  });

  it('Negative line offset', () => {
    let map = new SourceMap('/test-root');

    map.addRawMappings({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    map.offsetLines(2, -1);

    assert.deepEqual(map.getMap(), {
      sources: ['./helloworld.coffee'],
      sourcesContent: [''],
      names: [],
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 1, column: 2 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 1, column: 9 },
          original: { line: 1, column: 7 },
          source: 0,
        },
        {
          generated: { line: 1, column: 10 },
          original: { line: 1, column: 8 },
          source: 0,
        },
        {
          generated: { line: 1, column: 13 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 1, column: 14 },
          original: { line: 1, column: 12 },
          source: 0,
        },
        {
          generated: { line: 1, column: 27 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 1, column: 28 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 1, column: 29 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 2, column: 0 },
          original: { line: 1, column: 0 },
          source: 0,
        },
      ],
    });
  });

  it('Line offset empty map', () => {
    let map = new SourceMap('/');

    map.offsetLines(1, 2);
    map.offsetLines(2, 5);

    assert.deepEqual(map.getMap(), {
      sources: [],
      sourcesContent: [],
      names: [],
      mappings: [],
    });
  });
});
