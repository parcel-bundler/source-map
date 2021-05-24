// @flow
import type { ParsedMap, VLQMap, SourceMapStringifyOptions, IndexedMapping, GenerateEmptyMapOptions } from './types';
import path from 'path';
import SourceMap from './SourceMap';

const bindings = require('../parcel_sourcemap_wasm/dist-node/parcel_sourcemap_wasm.js');
// $FlowFixMe
export const init = Promise.resolve();

export default class WasmSourceMap extends SourceMap {
  constructor(opts: string | Buffer = '/') {
    super(opts);
    this.sourceMapInstance = new bindings.SourceMap(opts);
    this.projectRoot = this.sourceMapInstance.getProjectRoot();
  }

  addVLQMap(map: VLQMap, lineOffset: number = 0, columnOffset: number = 0): SourceMap {
    let { sourcesContent, sources = [], mappings, names = [] } = map;
    if (!sourcesContent) {
      sourcesContent = sources.map(() => '');
    } else {
      sourcesContent = sourcesContent.map((content) => (content ? content : ''));
    }
    this.sourceMapInstance.addVLQMap(
      mappings,
      sources,
      sourcesContent.map((content) => (content ? content : '')),
      names,
      lineOffset,
      columnOffset
    );
    return this;
  }

  addSourceMap(sourcemap: SourceMap, lineOffset: number = 0, columnOffset: number = 0): SourceMap {
    if (!(sourcemap.sourceMapInstance instanceof bindings.SourceMap)) {
      throw new Error('The sourcemap provided to addSourceMap is not a valid sourcemap instance');
    }

    this.sourceMapInstance.addSourceMap(sourcemap.sourceMapInstance, lineOffset, columnOffset);
    return this;
  }

  addBuffer(buffer: Buffer, lineOffset: number = 0, columnOffset: number = 0): SourceMap {
    let previousMap = new WasmSourceMap(buffer);
    return this.addSourceMap(previousMap, lineOffset, columnOffset);
  }

  extends(input: Buffer | SourceMap): SourceMap {
    // $FlowFixMe
    let inputSourceMap: SourceMap = input instanceof Uint8Array ? new WasmSourceMap(input) : input;
    this.sourceMapInstance.extends(inputSourceMap.sourceMapInstance);
    return this;
  }

  delete() {}

  static generateEmptyMap({
    projectRoot,
    sourceName,
    sourceContent,
    lineOffset = 0,
  }: GenerateEmptyMapOptions): WasmSourceMap {
    let map = new WasmSourceMap(projectRoot);
    map.addEmptyMap(sourceName, sourceContent, lineOffset);
    return map;
  }
}
