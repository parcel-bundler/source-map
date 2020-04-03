// @flow
import type {
  ParsedMap,
  VLQMap,
  SourceMapStringifyOptions,
  IndexedMapping,
} from "./types";

import path from "path";
import { generateInlineMap, partialVlqMapToSourceMap } from "./utils";

const bindings = require("node-gyp-build")(path.join(__dirname, ".."));

export default class SourceMap {
  sourceMapInstance: any;

  constructor() {
    this.sourceMapInstance = new bindings.SourceMap();
  }

  static generateEmptyMap(
    sourceName: string,
    sourceContent: string,
    lineOffset: number = 0
  ): SourceMap {
    let map = new SourceMap();
    map.addEmptyMap(sourceName, sourceContent, lineOffset);
    return map;
  }

  addEmptyMap(
    sourceName: string,
    sourceContent: string,
    lineOffset: number = 0
  ) {
    this.sourceMapInstance.addEmptyMap(sourceName, sourceContent, lineOffset);
    return this;
  }

  addRawMappings(
    mappings: string,
    sources: Array<string>,
    names: Array<string>,
    lineOffset: number = 0,
    columnOffset: number = 0
  ) {
    this.sourceMapInstance.addRawMappings(
      mappings,
      sources,
      names,
      lineOffset,
      columnOffset
    );
    return this;
  }

  addBufferMappings(
    buffer: Buffer,
    lineOffset: number = 0,
    columnOffset: number = 0
  ) {
    this.sourceMapInstance.addBufferMappings(buffer, lineOffset, columnOffset);
    return this;
  }

  // line numbers start at 1 so we have the same api as `source-map` by mozilla
  addIndexedMappings(
    mappings: Array<IndexedMapping<number | string>>,
    lineOffset?: number = 0,
    columnOffset?: number = 0
  ) {
    this.sourceMapInstance.addIndexedMappings(
      mappings,
      lineOffset,
      columnOffset
    );
    return this;
  }

  addNames(names: Array<string>): Array<number> {
    return this.sourceMapInstance.addNames(names);
  }

  addSources(sources: Array<string>): Array<number> {
    return this.sourceMapInstance.addSources(sources);
  }

  getSourceIndex(source: string): number {
    return this.sourceMapInstance.getSourceIndex(source);
  }

  getNameIndex(name: string): number {
    return this.sourceMapInstance.getNameIndex(name);
  }

  findClosestMapping(line: number, column: number): ?IndexedMapping<number> {
    return this.sourceMapInstance.findClosestMapping(line, column);
  }

  // Remaps original positions from this map to the ones in the provided map
  extends(buffer: Buffer) {
    this.sourceMapInstance.extends(buffer);
    return this;
  }

  getMap(): ParsedMap {
    return this.sourceMapInstance.getMap();
  }

  toBuffer(): Buffer {
    return this.sourceMapInstance.toBuffer();
  }

  toVLQ(): VLQMap {
    return this.sourceMapInstance.stringify();
  }

  async stringify(options: SourceMapStringifyOptions) {
    return partialVlqMapToSourceMap(this.toVLQ(), options);
  }
}

export const init = Promise.resolve();
