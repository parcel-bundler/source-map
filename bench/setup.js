const { default: SourceMap, init } = process.env.BACKEND === 'wasm' ? require('../dist/wasm') : require('..');

module.exports = { SourceMap, init };
