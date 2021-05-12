const b = require('benny');
const { SourceMap } = require('./setup');

exports.consume = function () {
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
    b.add('consume vlq mappings', () => {
      let map = new SourceMap();
      map.addRawMappings({
        mappings: rawSourceMap.mappings,
        sources: rawSourceMap.sources,
        names: rawSourceMap.names,
      });
      map.delete();
    }),
    b.add('consume flatbuffer', () => {
      let map = new SourceMap(sourcemapBuffer);
      map.delete();
    }),
    b.add('consume JS Mappings', () => {
      let map = new SourceMap();
      map.addIndexedMappings(mappings);
      map.delete();
    }),
    b.cycle(),
    b.complete()
  );
};
