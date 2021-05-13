// // @flow
// import type { ParsedMap, VLQMap, SourceMapStringifyOptions, IndexedMapping, GenerateEmptyMapOptions } from './types';
// import path from 'path';
// import SourceMap from './SourceMap';
// import {relatifyPath} from './utils';

// let Module;

// function arrayFromEmbind(from, mutate): any {
//   let arr = [];
//   for (let i = from.size() - 1; i >= 0; i--) {
//     arr[i] = from.get(i);
//     if (mutate) mutate(arr[i]);
//   }
//   from.delete();
//   return arr;
// }

// function patchMapping(mapping: any): any {
//   mapping.generated.line++;
//   if (mapping.name < 0) delete mapping.name;
//   if (mapping.source < 0) {
//     delete mapping.source;
//     delete mapping.original;
//   } else {
//     mapping.original.line++;
//   }
//   return mapping;
// }

// function arrayToEmbind(VectorType, from): any {
//   let arr = new VectorType();
//   for (let v of from) {
//     arr.push_back(v);
//   }
//   return arr;
// }

// export default class WasmSourceMap extends SourceMap {
//   constructor(projectRoot: string = '/') {
//     super(projectRoot);
//     this.sourceMapInstance = new Module.SourceMap();
//   }

//   static generateEmptyMap({
//     projectRoot,
//     sourceName,
//     sourceContent,
//     lineOffset = 0,
//   }: GenerateEmptyMapOptions): WasmSourceMap {
//     let map = new WasmSourceMap(projectRoot);
//     map.addEmptyMap(relatifyPath(sourceName, projectRoot), sourceContent, lineOffset);
//     return map;
//   }

//   addVLQMap(
//     map: VLQMap,
//     lineOffset: number = 0,
//     columnOffset: number = 0
//   ) {
//     let { sourcesContent, sources = [], mappings, names = [] } = map;
//     sources = sources.map((source) => (source ? relatifyPath(source, this.projectRoot) : ''));
//     if (!sourcesContent) {
//       sourcesContent = sources.map(() => '');
//     } else {
//       sourcesContent = sourcesContent.map((content) => (content ? content : ''));
//     }
//     let sourcesVector = arrayToEmbind(Module.VectorString, sources);
//     let namesVector = arrayToEmbind(Module.VectorString, names);
//     let sourcesContentVector = arrayToEmbind(Module.VectorString, sourcesContent);
//     this.sourceMapInstance.addVLQMap(
//       mappings,
//       sourcesVector,
//       sourcesContentVector,
//       namesVector,
//       lineOffset,
//       columnOffset
//     );
//     sourcesVector.delete();
//     sourcesContentVector.delete();
//     namesVector.delete();
//     return this;
//   }

//   addIndexedMappings(
//     mappings: Array<IndexedMapping<string>>,
//     lineOffset?: number = 0,
//     columnOffset?: number = 0
//   ): SourceMap {
//     let mappingBuffer = this._indexedMappingsToInt32Array(mappings, lineOffset, columnOffset);
//     let mappingBufferArray = arrayToEmbind(Module.VectorInt, mappingBuffer);
//     this.sourceMapInstance.addIndexedMappings(mappingBufferArray);
//     mappingBufferArray.delete();
//     return this;
//   }

//   findClosestMapping(line: number, column: number): ?IndexedMapping<string> {
//     let mapping = this.sourceMapInstance.findClosestMapping(line, column);
//     if (mapping.generated.line === -1 || mapping.generated.column === -1) {
//       return null;
//     } else {
//       let m = { ...mapping };
//       return this.indexedMappingToStringMapping(patchMapping(m));
//     }
//   }

//   getSourcesContent(): Array<string | null> {
//     return arrayFromEmbind(this.sourceMapInstance.getSourcesContent());
//   }

//   getSources(): Array<string> {
//     return arrayFromEmbind(this.sourceMapInstance.getSources());
//   }

//   getNames(): Array<string> {
//     return arrayFromEmbind(this.sourceMapInstance.getNames());
//   }

//   getMappings(): Array<IndexedMapping<number>> {
//     return arrayFromEmbind(this.sourceMapInstance.getMappings(), patchMapping);
//   }

//   toVLQ(): VLQMap {
//     return {
//       mappings: this.sourceMapInstance.getVLQMappings(),
//       sources: arrayFromEmbind(this.sourceMapInstance.getSources()),
//       sourcesContent: arrayFromEmbind(this.sourceMapInstance.getSourcesContent()),
//       names: arrayFromEmbind(this.sourceMapInstance.getNames()),
//     };
//   }

//   // $FlowFixMe don't know how we'll handle this yet...
//   toBuffer(): Uint8Array {
//     return new Uint8Array(this.sourceMapInstance.toBuffer());
//   }

//   delete() {
//     this.sourceMapInstance.delete();
//   }
// }

// export function init(RawModule: any) {
//   return new Promise<void>((res) =>
//     RawModule().then((v) => {
//       Module = v;
//       res();
//     })
//   );
// }
