// @flow
import type {
  ParsedMap,
  VLQMap,
  SourceMapStringifyOptions,
  IndexedMapping,
} from "./types";

import path from "path";
import { generateInlineMap, partialVlqMapToSourceMap } from "./utils";

let Module;

function arrayFromEmbind(from, mutate): any {
  let arr = [];
  for (let i = from.size() - 1; i >= 0; i--) {
    arr[i] = from.get(i);
    if (mutate) mutate(arr[i]);
  }
  from.delete();
  return arr;
}

function patchMapping(mapping: any): any {
  mapping.generated.line++;
  if (mapping.name < 0) delete mapping.name;
  if (mapping.source < 0) {
    delete mapping.source;
    delete mapping.original;
  } else {
    mapping.original.line++;
  }
}

function arrayToEmbind(Type, from): any {
  let arr = new Module.VectorString();
  for (let v of from) {
    arr.push_back(v);
  }
  return arr;
}

export default class SourceMap {
  sourceMapInstance: any;

  constructor() {
    this.sourceMapInstance = new Module.SourceMap();
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
    let sourcesVector = arrayToEmbind(Module.VectorString, sources);
    let namesVector = arrayToEmbind(Module.VectorString, names);
    this.sourceMapInstance.addRawMappings(
      mappings,
      sourcesVector,
      namesVector,
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
    for (let mapping of mappings) {
      let hasValidOriginal =
        mapping.original &&
        typeof mapping.original.line === "number" &&
        !isNaN(mapping.original.line) &&
        typeof mapping.original.column === "number" &&
        !isNaN(mapping.original.column);

      this.sourceMapInstance.addIndexedMapping(
        mapping.generated.line + lineOffset - 1,
        mapping.generated.column + columnOffset,
        // $FlowFixMe
        hasValidOriginal ? mapping.original.line - 1 : -1,
        // $FlowFixMe
        hasValidOriginal ? mapping.original.column : -1,
        mapping.source || "",
        mapping.name || ""
      );
    }
    return this;
  }

  addNames(names: Array<string>): Array<number> {
    return arrayFromEmbind(
      this.sourceMapInstance.addNames(arrayToEmbind(Module.VectorInt, names))
    );
  }

  addSources(sources: Array<string>): Array<number> {
    return arrayFromEmbind(
      this.sourceMapInstance.addSources(
        arrayToEmbind(Module.VectorInt, sources)
      )
    );
  }

  getSourceIndex(source: string): number {
    return this.sourceMapInstance.getSourceIndex(source);
  }

  getNameIndex(name: string): number {
    return this.sourceMapInstance.getNameIndex(name);
  }

  findClosestMapping(line: number, column: number): ?IndexedMapping<number> {
    let mapping = this.sourceMapInstance.findClosestMapping(line, column);
    if (mapping.generated.line === -1) return null;
    else {
      patchMapping(mapping);
      return mapping;
    }
  }

  extends(buffer: Buffer) {
    this.sourceMapInstance.extends(buffer);
    return this;
  }

  getMap(): ParsedMap {
    let mappings = arrayFromEmbind(
      this.sourceMapInstance.getMappings(),
      patchMapping
    );

    return {
      mappings,
      sources: arrayFromEmbind(this.sourceMapInstance.getSources()),
      names: arrayFromEmbind(this.sourceMapInstance.getNames()),
    };
  }

  toBuffer(): Buffer {
    return this.sourceMapInstance.toBuffer();
  }

  toVLQ(): VLQMap {
    return {
      mappings: this.sourceMapInstance.getVLQMappings(),
      sources: arrayFromEmbind(this.sourceMapInstance.getSources()),
      names: arrayFromEmbind(this.sourceMapInstance.getNames()),
    };
  }

  async stringify(options: SourceMapStringifyOptions) {
    return partialVlqMapToSourceMap(this.toVLQ(), options);
  }
}

export function init(RawModule) {
  return new Promise<void>((res) =>
    RawModule().then((v) => {
      Module = v;
      res();
    })
  );
}
