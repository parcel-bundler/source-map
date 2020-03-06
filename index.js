const bindings = require("node-gyp-build")(__dirname);
const path = require("path");

function generateInlineMap(map) {
  return `data:application/json;charset=utf-8;base64,${Buffer.from(
    map
  ).toString("base64")}`;
}

class SourceMap {
  // constructor(mappings: string, sources: Array<string>, names: Array<string>, lineOffset: number = 0, columnOffset: number = 0): void
  // constructor(mappings: Array<{source: Position, original: Position, name: string | number, source: string | number}>, lineOffset: number = 0, columnOffset: number = 0): void
  // constructor(buffer: Buffer, lineOffset: number = 0, columnOffset: number = 0): void
  constructor(...args) {
    this.sourceMapInstance = new bindings.SourceMap(...args);
  }

  // generateEmptyMap(sourceName: string, sourceContent: string, lineOffset: number = 0): SourceMap
  static generateEmptyMap(sourceName, sourceContent, lineOffset = 0) {
    let map = new SourceMap();
    map.generateEmptyMap(sourceName, sourceContent, lineOffset);
    return map;
  }

  // addRawMappings(mappings: string, sources: Array<string>, names: Array<string>, lineOffset: number = 0, columnOffset: number = 0): SourceMap
  addRawMappings(mappings, sources, names, lineOffset = 0, columnOffset = 0) {
    this.sourceMapInstance.addRawMappings(
      mappings,
      sources,
      names,
      lineOffset,
      columnOffset
    );
    return this;
  }

  // addBufferMappings(buffer: Buffer, lineOffset: number = 0, columnOffset: number = 0): SourceMap
  addBufferMappings(buffer, lineOffset = 0, columnOffset = 0) {
    this.sourceMapInstance.addBufferMappings(buffer, lineOffset, columnOffset);
    return this;
  }

  // addIndexedMappings(mappings: Array<{source: Position, original: Position, name: string | number, source: string | number}>, lineOffset: number = 0, columnOffset: number = 0): SourceMap
  addIndexedMappings(mappings, lineOffset = 0, columnOffset = 0) {
    this.sourceMapInstance.addIndexedMappings(mappings, lineOffset, columnOffset);
    return this;
  }

  // addNames(names: Array<string>): Array<number>
  addNames(names) {
    return this.sourceMapInstance.addNames(names);
  }

  // addSources(sources: Array<string>): Array<number>
  addSources(sources) {
    return this.sourceMapInstance.addSources(sources);
  }

  // getSourceIndex(source: string): number
  getSourceIndex(source) {
    return this.sourceMapInstance.getSourceIndex(source);
  }

  // getNameIndex(name: string): number
  getNameIndex(name) {
    return this.sourceMapInstance.getNameIndex(name);
  }

  // Remaps original positions from this map to the ones in the provided map
  // extends(buffer: Buffer): SourceMap
  extends(buffer) {
    this.sourceMapInstance.extends(buffer);
    return this;
  }

  // getMap(): {sources: Array<string>, names: Array<string>, mappings: Array<{source: Position, original: Position, name: number, source: number}>}}
  getMap() {
    return this.sourceMapInstance.getMap();
  }

  // toBuffer(): Buffer
  toBuffer() {
    return this.sourceMapInstance.toBuffer();
  }

  async stringify({ file, sourceRoot, rootDir, inlineSources, inlineMap, fs }) {
    let map = this.sourceMapInstance.stringify();
    map.version = 3;
    map.file = file;
    map.sourceRoot = sourceRoot;

    if (inlineSources) {
      map.sourcesContent = await Promise.all(
        map.sources.map(async sourceName => {
          try {
            return await fs.readFile(
              path.join(rootDir || "", sourceName),
              "utf-8"
            );
          } catch (e) {
            return null;
          }
        })
      );
    }
    
    let stringifiedMap = JSON.stringify(map);
    return inlineMap ? generateInlineMap(stringifiedMap) : stringifiedMap;
  }
}

SourceMap.default = SourceMap;
module.exports = SourceMap;
