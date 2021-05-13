// @flow
import type { ParsedMap, VLQMap, SourceMapStringifyOptions, IndexedMapping, GenerateEmptyMapOptions } from './types';
import path from 'path';
import SourceMap from './SourceMap';

const bindings = require('../parcel_sourcemap_node/index');

export default class NodeSourceMap extends SourceMap {
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

  addIndexedMappings(
    mappings: Array<IndexedMapping<string>>,
    lineOffset?: number = 0,
    columnOffset?: number = 0
  ): SourceMap {
    let mappingBuffer = this._indexedMappingsToInt32Array(mappings, lineOffset, columnOffset);
    this.sourceMapInstance.addIndexedMappings(mappingBuffer);
    return this;
  }

  fromBuffer(buffer: Buffer): this {
    this.sourceMapInstance.fromBuffer(buffer);
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

  addSourceMap(sourcemap: SourceMap, lineOffset: number = 0, columnOffset: number = 0): SourceMap {
    this.sourceMapInstance.addSourceMap(sourcemap.sourceMapInstance, lineOffset, columnOffset);
    return this;
  }

  addBuffer(buffer: Buffer, lineOffset: number = 0, columnOffset: number = 0): SourceMap {
    let previousMap = new NodeSourceMap(buffer);
    return this.addSourceMap(previousMap, lineOffset, columnOffset);
  }

  extends(input: Buffer | SourceMap): SourceMap {
    // $FlowFixMe
    let inputSourceMap: SourceMap = Buffer.isBuffer(input) ? new NodeSourceMap(input) : input;
    this.sourceMapInstance.extends(inputSourceMap.sourceMapInstance);
    return this;
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

// $FlowFixMe
export const init = Promise.resolve();
