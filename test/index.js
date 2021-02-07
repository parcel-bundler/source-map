require('segfault-handler');

if (!process.env.BACKEND || process.env.BACKEND === 'node') {
  module.exports = require('../dist/node');
} else if (process.env.BACKEND === 'wasm') {
  module.exports = require('../dist/wasm-node');
}

beforeEach(async () => {
  await module.exports.init;
});
