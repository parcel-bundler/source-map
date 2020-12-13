// @flow
import type { ParsedMap, VLQMap, SourceMapStringifyOptions, IndexedMapping, GenerateEmptyMapOptions } from './types';
import path from 'path';
import SourceMap from './SourceMap';
import { relatifyPath } from './utils';

const bindings = require('node-gyp-build')(path.join(__dirname, '..'));

export default class NodeSourceMap extends SourceMap {
  constructor(projectRoot: string = '/') {
    super(projectRoot);
    this.sourceMapInstance = new bindings.SourceMap();
  }

  addRawMappings(map: VLQMap, lineOffset: number = 0, columnOffset: number = 0): SourceMap {
    let { sourcesContent, sources = [], mappings, names = [] } = map;
    if (!sourcesContent) {
      sourcesContent = sources.map(() => '');
    } else {
      sourcesContent = sourcesContent.map((content) => (content ? content : ''));
    }
    this.sourceMapInstance.addRawMappings(
      mappings,
      sources.map((source) => (source ? relatifyPath(source, this.projectRoot) : '')),
      sourcesContent.map((content) => (content ? content : '')),
      names,
      lineOffset,
      columnOffset
    );
    return this;
  }

  addIndexedMappings(
    mappings: Array<IndexedMapping<string>>,
    lineOffset?: number = 0,
    columnOffset?: number = 0
  ): SourceMap {
    let mappingBuffer = this._indexedMappingsToInt32Array(mappings, lineOffset, columnOffset);
    this.sourceMapInstance.addIndexedMappings(mappingBuffer);
    return this;
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

  static generateEmptyMap({
    projectRoot,
    sourceName,
    sourceContent,
    lineOffset = 0,
  }: GenerateEmptyMapOptions): NodeSourceMap {
    let map = new NodeSourceMap(projectRoot);
    map.addEmptyMap(sourceName, sourceContent, lineOffset);
    return map;
  }
}

export const init = Promise.resolve();
