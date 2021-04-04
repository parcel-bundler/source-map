const b = require('benny');
const { SourceMap } = require('./setup');

exports.serialize = function () {
  let mappings = new Array(100).fill('').map((item, index) => {
    return {
      source: 'index.js',
      name: 'A',
      original: {
        line: index + 1,
        column: 0 + 10 * index,
      },
      generated: {
        line: 1,
        column: 15 + 10 * index,
      },
    };
  });

  let sourcemapInstance = new SourceMap();
  sourcemapInstance.addIndexedMappings(mappings);
  let sourcemapBuffer = sourcemapInstance.toBuffer();
  let rawSourceMap = sourcemapInstance.toVLQ();

  return b.suite(
    'consume',
    b.add('Save buffer', () => {
      sourcemapInstance.toBuffer();
    }),
    b.add('Serialize to vlq', () => {
      sourcemapInstance.toVLQ();
    }),
    b.cycle(),
    b.complete()
  );
};
