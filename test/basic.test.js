import assert from 'assert';
import SourceMap from '.';

const SIMPLE_SOURCE_MAP = {
  version: 3,
  file: 'helloworld.js',
  sources: ['helloworld.coffee'],
  names: [],
  mappings: 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA',
};

const PROCESSED_MAP = {
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
  ],
};

describe('SourceMap - Basics', () => {
  it('Should be able to instantiate a SourceMap with vlq mappings', async () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });
    let vlqMap = map.toVLQ();
    assert.equal(vlqMap.mappings, SIMPLE_SOURCE_MAP.mappings);
  });

  it('Should be able to output the processed map as a JS Object', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    assert.deepEqual(map.getMap(), PROCESSED_MAP);
  });

  it('Should be able to output the processed mappings as JS Objects', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    assert.deepEqual(map.getMappings(), PROCESSED_MAP.mappings);
  });

  it('Should be able to instantiate a SourceMap with processed mappings', async () => {
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
    ]);

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
      mappings: ';;;;;eAAAA',
      sources: ['index.js'],
      sourcesContent: [null],
      names: ['A'],
    });
  });

  it('Should be able to handle undefined name field using addIndexedMappings', async () => {
    let map = new SourceMap('/test-root');

    map.addIndexedMappings([
      {
        source: 'index.js',
        name: undefined,
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
      mappings: ';;;;;eAAA',
      sources: ['index.js'],
      sourcesContent: [null],
      names: [],
    });
  });

  it('Should be able to handle undefined name and source field using addIndexedMappings', async () => {
    let map = new SourceMap('/test-root');

    map.addIndexedMappings([
      {
        source: undefined,
        name: undefined,
        original: undefined,
        generated: {
          line: 6,
          column: 15,
        },
      },
    ]);

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
      mappings: ';;;;;e',
      sources: [],
      sourcesContent: [],
      names: [],
    });
  });

  it('Should be able to create a SourceMap buffer and construct a new SourceMap from it', async () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      sourcesContent: ['() => "test"'],
      names: SIMPLE_SOURCE_MAP.names,
    });
    let buffer = map.toBuffer();
    let newMap = new SourceMap();
    newMap.addBuffer(buffer);
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
      sources: ['helloworld.coffee'],
      sourcesContent: ['() => "test"'],
      names: SIMPLE_SOURCE_MAP.names,
      mappings: SIMPLE_SOURCE_MAP.mappings,
    });
  });

  it('Should be able to add sources to a sourcemap', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    assert.deepEqual(map.addSources(['index.js']), [1]);
    assert.deepEqual(map.addSources(['test.js', 'execute.js']), [2, 3]);

    assert.deepEqual(map.addSource('abc.js'), 4);
    assert.deepEqual(map.addSource("dist/rörfokus/4784.js"), 5);
  });

  it('Should be able to handle absolute url sources', () => {
    let map = new SourceMap('/test-root');
    map.addSource('https://example.com/a.js');
    map.addSource('file:///test-root/example.js');
    map.addSource('webpack://weird-things/index.ts');
    assert.deepEqual(map.getSource(0), 'https://example.com/a.js');
    assert.deepEqual(map.getSource(1), 'example.js');
    assert.deepEqual(map.getSource(2), 'webpack://weird-things/index.ts');
  });

  it('Should be able to add names to a sourcemap', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    assert.deepEqual(map.addNames(['run']), [0]);
    assert.deepEqual(map.addNames(['processQueue', 'processNode']), [1, 2]);

    assert.deepEqual(map.addName('window'), 3);
  });

  it('Should be able to return source index', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    map.addSources(['test.ts']);
    assert.equal(map.getSourceIndex('helloworld.coffee'), 0);
    assert.equal(map.getSourceIndex('e.coffee'), -1);
    assert.equal(map.getSourceIndex('test.ts'), 1);
  });

  it('Should be able to return name index', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    map.addNames(['test']);
    assert.equal(map.getNameIndex('test'), 0);
    assert.equal(map.getNameIndex('something'), -1);
  });

  it('Should be able to return source for a certain index', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    assert.equal(map.getSource(0), 'helloworld.coffee');
    assert.equal(map.getSource(1), '');
  });

  it('Should be able to return all sources', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    assert.deepEqual(map.getSources(), ['helloworld.coffee']);

    map.addSource('b.jsx');
    map.addSource('/test-root/c.ts');
    assert.deepEqual(map.getSources(), ['helloworld.coffee', 'b.jsx', 'c.ts']);
  });

  it('Should be able to return a map of all sources and their content', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    map.setSourceContent('./helloworld.coffee', 'hello-world');
    map.addSource('b.jsx');
    map.setSourceContent('/test-root/b.jsx', 'content-b');
    map.addSource('/test-root/c.ts');
    map.setSourceContent('/test-root/d.tsx', 'tsx-content-d');

    assert.deepEqual(map.getSourcesContentMap(), {
      'helloworld.coffee': 'hello-world',
      'b.jsx': 'content-b',
      'c.ts': null,
      'd.tsx': 'tsx-content-d',
    });
  });

  it('Should be able to return name for a certain index', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    map.addNames(['test']);
    assert.equal(map.getName(0), 'test');
    assert.equal(map.getName(1), '');
  });

  it('Should be able to return all names', () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    map.addName('test');
    assert.deepEqual(map.getNames(), ['test']);

    map.addName('test-two');
    map.addName('test-three');
    assert.deepEqual(map.getNames(), ['test', 'test-two', 'test-three']);
  });

  it('Should be able to store and return sourceContents', async () => {
    let map = new SourceMap('/test-root');
    map.addVLQMap({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      sourcesContent: ['module.exports = () => "hello world";'],
      names: SIMPLE_SOURCE_MAP.names,
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
      sources: ['helloworld.coffee'],
      sourcesContent: ['module.exports = () => "hello world";'],
      names: [],
      mappings: 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA',
    });

    assert.equal(map.getSourceContent('helloworld.coffee'), 'module.exports = () => "hello world";');
  });
});
