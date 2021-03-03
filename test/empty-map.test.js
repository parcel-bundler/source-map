import assert from 'assert';
import SourceMap from '.';

describe('SourceMap - Empty Map', () => {
  it('Should be able to create a 1 to 1 map from a sourcefile', async () => {
    let sourceContent = `
      function test() {
        return "hello world!";
      }
    `;
    let map = SourceMap.generateEmptyMap({
      projectRoot: '/test-root',
      sourceName: '/test-root/index.js',
      sourceContent: sourceContent,
    });

    let mapContent = map.getMap();
    assert.deepEqual(mapContent, {
      sources: ['./index.js'],
      sourcesContent: [sourceContent],
      names: [],
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 2, column: 0 },
          original: { line: 2, column: 0 },
          source: 0,
        },
        {
          generated: { line: 3, column: 0 },
          original: { line: 3, column: 0 },
          source: 0,
        },
        {
          generated: { line: 4, column: 0 },
          original: { line: 4, column: 0 },
          source: 0,
        },
      ],
    });
  });

  it('Should be able to create a 1 to 1 map from a sourcefile with a lineOffset', async () => {
    let sourceContent = `
    function test() {
      return "hello world!";
    }
  `;
    let map = SourceMap.generateEmptyMap({
      projectRoot: '/test-root',
      sourceName: 'index.js',
      sourceContent,
      lineOffset: 10,
    });

    let mapContent = map.getMap();
    assert.deepEqual(mapContent, {
      sources: ['./index.js'],
      sourcesContent: [sourceContent],
      names: [],
      mappings: [
        {
          generated: { line: 11, column: 0 },
          original: { line: 1, column: 0 },
          source: 0,
        },
        {
          generated: { line: 12, column: 0 },
          original: { line: 2, column: 0 },
          source: 0,
        },
        {
          generated: { line: 13, column: 0 },
          original: { line: 3, column: 0 },
          source: 0,
        },
        {
          generated: { line: 14, column: 0 },
          original: { line: 4, column: 0 },
          source: 0,
        },
      ],
    });
  });
});
