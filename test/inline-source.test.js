const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const SourceMap = require('.').default;

const SIMPLE_SOURCE_MAP = {
  version: 3,
  file: 'bundle.js',
  sources: ['../a.js', 'b.js'],
  names: [],
  mappings: 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA',
};

const ROOT_DIR = path.join(__dirname, 'integration/sub-folder');

describe('SourceMap - Inline Sources', () => {
  it('Should be able to inline sources', async () => {
    let map = new SourceMap();
    map.addRawMappings({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    let stringifiedMap = await map.stringify({
      file: 'bundle.js.map',
      sourceRoot: '/',
      format: 'object',
      fs,
      rootDir: ROOT_DIR,
      inlineSources: true,
    });

    assert.deepEqual(stringifiedMap, {
      mappings: 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA',
      sources: ['../a.js', './b.js'],
      sourcesContent: [
        "module.exports = () => {\n  return 'a';\n};\n",
        "module.exports = () => {\n  return 'b';\n};\n",
      ],
      names: [],
      version: 3,
      file: 'bundle.js.map',
      sourceRoot: '/',
    });
  });

  it('Should always inline sources outside the root', async () => {
    let map = new SourceMap();
    map.addRawMappings({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
    });

    let stringifiedMap = await map.stringify({
      file: 'bundle.js.map',
      sourceRoot: '/',
      format: 'object',
      fs,
      rootDir: ROOT_DIR,
      inlineSources: false,
    });

    assert.deepEqual(stringifiedMap, {
      mappings: 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA',
      sources: ['../a.js', './b.js'],
      sourcesContent: ["module.exports = () => {\n  return 'a';\n};\n", null],
      names: [],
      version: 3,
      file: 'bundle.js.map',
      sourceRoot: '/',
    });
  });

  it('Should not overwrite existing sourceContent when inlining is true', async () => {
    let map = new SourceMap();
    map.addRawMappings({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
      sourcesContent: [null, 'b-content'],
    });

    let stringifiedMap = await map.stringify({
      file: 'bundle.js.map',
      sourceRoot: '/',
      format: 'object',
      fs,
      rootDir: ROOT_DIR,
      inlineSources: true,
    });

    assert.deepEqual(stringifiedMap, {
      mappings: 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA',
      sources: ['../a.js', './b.js'],
      sourcesContent: ["module.exports = () => {\n  return 'a';\n};\n", 'b-content'],
      names: [],
      version: 3,
      file: 'bundle.js.map',
      sourceRoot: '/',
    });
  });

  it('Should not overwrite existing sourceContent when inlining is false', async () => {
    let map = new SourceMap();
    map.addRawMappings({
      mappings: SIMPLE_SOURCE_MAP.mappings,
      sources: SIMPLE_SOURCE_MAP.sources,
      names: SIMPLE_SOURCE_MAP.names,
      sourcesContent: ['a-content', 'b-content'],
    });

    let stringifiedMap = await map.stringify({
      file: 'bundle.js.map',
      sourceRoot: '/',
      format: 'object',
      fs,
      rootDir: ROOT_DIR,
      inlineSources: false,
    });

    assert.deepEqual(stringifiedMap, {
      mappings: 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA',
      sources: ['../a.js', './b.js'],
      sourcesContent: ['a-content', 'b-content'],
      names: [],
      version: 3,
      file: 'bundle.js.map',
      sourceRoot: '/',
    });
  });
});
