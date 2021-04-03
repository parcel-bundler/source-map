// For debugging issues write minimal reproduction here...
const SourceMap = require('./').default;

let instance = new SourceMap();

instance.addSource('./test.js');
console.log(instance.getSource(0));
console.log(instance.getSources());
console.log(instance.getSourceIndex('./test.js'));

// Show an error
// try {
//   console.log(instance.getSource(115));
// } catch (err) {
//   console.error(err);
// }

instance.addName('test');
console.log(instance.getName(0));
console.log(instance.getNames());
console.log(instance.getNameIndex('test'));

instance.addIndexedMappings([
  {
    generated: {
      line: 1,
      column: 1,
    },
    original: {
      line: 15,
      column: 74,
    },
    source: './test.js',
    name: 'test',
  },
]);

console.log(instance);
