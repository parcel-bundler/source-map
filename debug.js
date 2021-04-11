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
  names: SIMPLE_SOURCE_MAP.names,
});
let vlqMap = map.toVLQ();
console.log(vlqMap);
