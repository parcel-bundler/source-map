// @flow
import type {
  ParsedMap,
  VLQMap,
  SourceMapStringifyOptions,
  IndexedMapping,
} from "./types";
import path from "path";
import SourceMap from "./SourceMap";

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
  return mapping;
}

function arrayToEmbind(Type, from): any {
  let arr = new Module.VectorString();
  for (let v of from) {
    arr.push_back(v);
  }
  return arr;
}

export default class WasmSourceMap extends SourceMap {
  constructor() {
    super();
    this.sourceMapInstance = new Module.SourceMap();
  }

  static generateEmptyMap(
    sourceName: string,
    sourceContent: string,
    lineOffset: number = 0
  ): WasmSourceMap {
    let map = new WasmSourceMap();
    map.addEmptyMap(sourceName, sourceContent, lineOffset);
    return map;
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
    sourcesVector.delete();
    namesVector.delete();
    return this;
  }

  findClosestMapping(line: number, column: number): ?IndexedMapping<string> {
    let mapping = this.sourceMapInstance.findClosestMapping(line, column);
    if (mapping.generated.line === -1) {
      mapping.delete();
      return null;
    } else {
      let m = { ...mapping };
      mapping.delete();
      return this.indexedMappingToStringMapping(patchMapping(m));
    }
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

  toVLQ(): VLQMap {
    return {
      mappings: this.sourceMapInstance.getVLQMappings(),
      sources: arrayFromEmbind(this.sourceMapInstance.getSources()),
      names: arrayFromEmbind(this.sourceMapInstance.getNames()),
    };
  }

  toBuffer(): Buffer {
    return new Uint8Array(this.sourceMapInstance.toBuffer());
  }
}

export function init(RawModule: any) {
  return new Promise<void>((res) =>
    RawModule().then((v) => {
      Module = v;
      res();
    })
  );
}
