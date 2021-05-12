import assert from 'assert';
import SourceMap from '.';

describe('SourceMap - Extend Map', () => {
  it('Basic extending', async function () {
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
  });

  it('Extending null mappings', async function () {
    let originalMap = new SourceMap('/test-root');

    originalMap.addIndexedMappings([
      {
        source: 'index.js',
        name: 'A',
        original: {
          line: 6,
          column: 15,
        },
        generated: {
          line: 5,
          column: 12,
        },
      },
      {
        generated: {
          line: 14,
          column: 165,
        },
      },
    ]);

    let newMap = new SourceMap('/test-root');

    newMap.addIndexedMappings([
      {
        source: 'index.js',
        name: 'B',
        original: {
          line: 14,
          column: 165,
        },
        generated: {
          line: 1,
          column: 15,
        },
      },
      {
        source: 'index.js',
        name: 'C',
        original: {
          line: 5,
          column: 12,
        },
        generated: {
          line: 1,
          column: 110,
        },
      },
    ]);

    newMap.extends(originalMap);

    let mappings = newMap.getMap().mappings;

    assert.equal(mappings.length, 2);
    assert.deepEqual(mappings[0], {
      generated: {
        line: 1,
        column: 15,
      },
    });
    assert.deepEqual(mappings[1], {
      source: 0,
      name: 2,
      original: {
        line: 6,
        column: 15,
      },
      generated: {
        line: 1,
        column: 110,
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
      mappings: 'e,+FAKeE',
      sources: ['index.js'],
      sourcesContent: [null],
      names: ['B', 'C', 'A'],
    });
  });

  it('Basic extending w/ sourceContents', async function () {
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

    originalMap.setSourceContent('index.js', '() => "test"');

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
      sourcesContent: ['() => "test"'],
      names: ['B', 'A'],
      mappings: ';;;;YAAAC',
    });
  });
});
