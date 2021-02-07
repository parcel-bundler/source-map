import assert from 'assert';
import SourceMap from '.';

describe.only('SourceMap - Find', () => {
  it('Should be able to find closest mapping to a generated position', async () => {
    let map = new SourceMap('/test-root');
    map.addRawMappings({
      mappings: 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA',
      sources: ['helloworld.coffee'],
      names: [],
    });

    let mapping = map.findClosestMapping(2, 14);
    assert.deepEqual(mapping, {
      generated: { line: 2, column: 14 },
      original: { line: 1, column: 12 },
      source: './helloworld.coffee',
    });

    mapping = map.findClosestMapping(2, 12);
    assert.deepEqual(mapping, {
      generated: { line: 2, column: 13 },
      original: { line: 1, column: 0 },
      source: './helloworld.coffee',
    });

    mapping = map.findClosestMapping(3, 15);
    assert.deepEqual(mapping, {
      generated: { line: 3, column: 0 },
      original: { line: 1, column: 0 },
      source: './helloworld.coffee',
    });

    // Edge cases
    mapping = map.findClosestMapping(50, 15);
    assert.equal(mapping, null);

    mapping = map.findClosestMapping(0, 0);
    assert.deepEqual(mapping, null);

    mapping = map.findClosestMapping(-2, -6);
    assert.deepEqual(mapping, null);
  });
});
