const { default: SourceMap, init } = process.env.BACKEND === 'wasm' ? require('../dist/wasm-node') : require('..');

module.exports = { SourceMap, init };
