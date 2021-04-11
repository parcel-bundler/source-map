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

map.setSourceContent('./helloworld.coffee', 'hello-world');
map.addSource('./b.jsx');
map.setSourceContent('/test-root/b.jsx', 'content-b');
map.addSource('/test-root/c.ts');
map.setSourceContent('/test-root/d.tsx', 'tsx-content-d');
