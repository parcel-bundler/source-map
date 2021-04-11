// @flow
import type { ParsedMap, VLQMap, SourceMapStringifyOptions, IndexedMapping, GenerateEmptyMapOptions } from './types';
import path from 'path';
import SourceMap from './SourceMap';
import { relatifyPath } from './utils';

const bindings = require('../parcel_sourcemap_node/index');

export default class NodeSourceMap extends SourceMap {
  constructor(projectRoot: string = '/') {
    super(projectRoot);
    this.sourceMapInstance = new bindings.SourceMap(projectRoot);
  }

  addRawMappings(map: VLQMap, lineOffset: number = 0, columnOffset: number = 0): SourceMap {
    let { sourcesContent, sources = [], mappings, names = [] } = map;
    if (!sourcesContent) {
      sourcesContent = sources.map(() => '');
    } else {
      sourcesContent = sourcesContent.map((content) => (content ? content : ''));
    }
    this.sourceMapInstance.addVLQMap(
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
    let mapping = this.sourceMapInstance.findClosestMapping(line - 1, column);
    if (mapping) {
      let v = this.indexedMappingToStringMapping(mapping);
      return v;
    } else {
      return null;
    }
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
