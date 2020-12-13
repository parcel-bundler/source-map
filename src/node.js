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
    // Encode all mappings into a single typed array and make one call
    // to C++ instead of one for each mapping to improve performance.
    let mappingBuffer = new Int32Array(mappings.length * 6);
    let sources: Map<string, number> = new Map();
    let names: Map<string, number> = new Map();
    let i = 0;
    for (let mapping of mappings) {
      let hasValidOriginal =
        mapping.original &&
        typeof mapping.original.line === 'number' &&
        !isNaN(mapping.original.line) &&
        typeof mapping.original.column === 'number' &&
        !isNaN(mapping.original.column);

      mappingBuffer[i++] = mapping.generated.line + lineOffset - 1;
      mappingBuffer[i++] = mapping.generated.column + columnOffset;
      // $FlowFixMe
      mappingBuffer[i++] = hasValidOriginal ? mapping.original.line - 1 : -1;
      // $FlowFixMe
      mappingBuffer[i++] = hasValidOriginal ? mapping.original.column : -1;

      let sourceIndex = mapping.source ? sources.get(mapping.source) : -1;
      if (sourceIndex == null) {
        // $FlowFixMe
        sourceIndex = this.addSource(mapping.source);
        // $FlowFixMe
        sources.set(mapping.source, sourceIndex);
      }
      mappingBuffer[i++] = sourceIndex;

      let nameIndex = mapping.name ? names.get(mapping.name) : -1;
      if (nameIndex == null) {
        // $FlowFixMe
        nameIndex = this.addName(mapping.name);
        // $FlowFixMe
        names.set(mapping.name, nameIndex);
      }
      mappingBuffer[i++] = nameIndex;
    }

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
