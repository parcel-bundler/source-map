// @flow
import type { ParsedMap, VLQMap, SourceMapStringifyOptions, IndexedMapping } from './types';
import path from 'path';
import SourceMap from './SourceMap';

const bindings = require('node-gyp-build')(path.join(__dirname, '..'));

export default class NodeSourceMap extends SourceMap {
  constructor() {
    super();
    this.sourceMapInstance = new bindings.SourceMap();
  }

  toBuffer(): Buffer {
    return this.sourceMapInstance.toBuffer();
  }

  findClosestMapping(line: number, column: number): ?IndexedMapping<string> {
    let mapping = this.sourceMapInstance.findClosestMapping(line, column);
    let v = this.indexedMappingToStringMapping(mapping);
    return v;
  }

  delete() {}

  static generateEmptyMap(sourceName: string, sourceContent: string, lineOffset: number = 0): NodeSourceMap {
    let map = new NodeSourceMap();
    map.addEmptyMap(sourceName, sourceContent, lineOffset);
    return map;
  }
}

export const init = Promise.resolve();
