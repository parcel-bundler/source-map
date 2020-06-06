import SourceMap, { init as _init } from './wasm.js';
import RawModule from '../wasm-browser/source-map.js';

export default SourceMap;
export const init = _init(RawModule);
