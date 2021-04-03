// For debugging issues write minimal reproduction here...
const SourceMap = require('./').default;

let instance = new SourceMap();

instance.addSource('./test.js');
console.log(instance.getSource(0));

// Show an error
try {
  console.log(instance.getSource(115));
} catch (err) {
  console.error(err);
}

console.log(instance);
