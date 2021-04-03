// For debugging issues write minimal reproduction here...
const SourceMap = require('./').default;

let instance = new SourceMap();

instance.addName('./test.js');

console.log(instance);
