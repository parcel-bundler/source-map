// For debugging issues write minimal reproduction here...
const SourceMap = require('./').default;

const SIMPLE_SOURCE_MAP = {
  version: 3,
  file: 'helloworld.js',
  sources: ['helloworld.coffee'],
  names: [],
  mappings: 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA',
};

let map = new SourceMap('/test-root');
map.addRawMappings({
  mappings: SIMPLE_SOURCE_MAP.mappings,
  sources: SIMPLE_SOURCE_MAP.sources,
  sourcesContent: ['() => "test"'],
  names: SIMPLE_SOURCE_MAP.names,
});
console.log(map.getMap());
let buffer = map.toBuffer();
let newMap = new SourceMap();
newMap.addBufferMappings(buffer);
console.log(newMap.getMap());
