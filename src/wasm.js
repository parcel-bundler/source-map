// @flow
import type { ParsedMap, VLQMap, SourceMapStringifyOptions, IndexedMapping } from './types';
import path from 'path';
import SourceMap from './SourceMap';

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

  static generateEmptyMap(sourceName: string, sourceContent: string, lineOffset: number = 0): WasmSourceMap {
    let map = new WasmSourceMap();
    map.addEmptyMap(sourceName, sourceContent, lineOffset);
    return map;
  }

  addRawMappings(
    map: VLQMap,
    lineOffset: number = 0,
    columnOffset: number = 0
  ) {
    let { sourcesContent, sources = [], mappings, names = [] } = map;
    if (!sourcesContent) {
      sourcesContent = sources.map(() => '');
    } else {
      sourcesContent = sourcesContent.map((content) => (content ? content : ''));
    }
    let sourcesVector = arrayToEmbind(Module.VectorString, sources);
    let namesVector = arrayToEmbind(Module.VectorString, names);
    let sourcesContentVector = arrayToEmbind(Module.VectorString, sourcesContent);
    this.sourceMapInstance.addRawMappings(
      mappings,
      sourcesVector,
      sourcesContentVector,
      namesVector,
      lineOffset,
      columnOffset
    );
    sourcesVector.delete();
    sourcesContentVector.delete();
    namesVector.delete();
    return this;
  }

  findClosestMapping(line: number, column: number): ?IndexedMapping<string> {
    let mapping = this.sourceMapInstance.findClosestMapping(line, column);
    if (mapping.generated.line === -1) {
      return null;
    } else {
      let m = { ...mapping };
      return this.indexedMappingToStringMapping(patchMapping(m));
    }
  }

  getMap(): ParsedMap {
    let mappings = arrayFromEmbind(this.sourceMapInstance.getMappings(), patchMapping);

    return {
      mappings,
      sources: arrayFromEmbind(this.sourceMapInstance.getSources()),
      sourcesContent: arrayFromEmbind(this.sourceMapInstance.getSourcesContent()),
      names: arrayFromEmbind(this.sourceMapInstance.getNames()),
    };
  }

  toVLQ(): VLQMap {
    return {
      mappings: this.sourceMapInstance.getVLQMappings(),
      sources: arrayFromEmbind(this.sourceMapInstance.getSources()),
      sourcesContent: arrayFromEmbind(this.sourceMapInstance.getSourcesContent()),
      names: arrayFromEmbind(this.sourceMapInstance.getNames()),
    };
  }

  // $FlowFixMe don't know how we'll handle this yet...
  toBuffer(): Uint8Array {
    return new Uint8Array(this.sourceMapInstance.toBuffer());
  }

  delete() {
    this.sourceMapInstance.delete();
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
