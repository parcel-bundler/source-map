import path from "path";

const bindings = require("node-gyp-build")(__dirname);

function generateInlineMap(map) {
  return `data:application/json;charset=utf-8;base64,${Buffer.from(map).toString("base64")}`;
}

export default class SourceMap {
  constructor() {
    this.sourceMapInstance = new bindings.SourceMap();
  } // addEmptyMap(sourceName: string, sourceContent: string, lineOffset: number = 0): SourceMap


  addEmptyMap(sourceName, sourceContent, lineOffset = 0) {
    this.sourceMapInstance.addEmptyMap(sourceName, sourceContent, lineOffset);
    return this;
  }

  addRawMappings(mappings, sources, names, lineOffset = 0, columnOffset = 0) {
    this.sourceMapInstance.addRawMappings(mappings, sources, names, lineOffset, columnOffset);
    return this;
  }

  addBufferMappings(buffer, lineOffset = 0, columnOffset = 0) {
    this.sourceMapInstance.addBufferMappings(buffer, lineOffset, columnOffset);
    return this;
  } // line numbers start at 1 so we have the same api as `source-map` by mozilla


  addIndexedMappings(mappings, lineOffset = 0, columnOffset = 0) {
    this.sourceMapInstance.addIndexedMappings(mappings, lineOffset, columnOffset);
    return this;
  }

  addNames(names) {
    return this.sourceMapInstance.addNames(names);
  }

  addSources(sources) {
    return this.sourceMapInstance.addSources(sources);
  }

  getSourceIndex(source) {
    return this.sourceMapInstance.getSourceIndex(source);
  }

  getNameIndex(name) {
    return this.sourceMapInstance.getNameIndex(name);
  }

  findClosestMapping(line, column) {
    return this.sourceMapInstance.findClosestMapping(line, column);
  } // Remaps original positions from this map to the ones in the provided map


  extends(buffer) {
    this.sourceMapInstance.extends(buffer);
    return this;
  }

  getMap() {
    return this.sourceMapInstance.getMap();
  }

  toBuffer() {
    return this.sourceMapInstance.toBuffer();
  }

  toVLQ() {
    return this.sourceMapInstance.stringify();
  }

  async stringify({
    file,
    sourceRoot,
    rootDir,
    inlineSources,
    inlineMap,
    fs
  }) {
    let map = this.sourceMapInstance.stringify();
    map.version = 3;
    map.file = file;
    map.sourceRoot = sourceRoot;

    if (inlineSources && fs) {
      map.sourcesContent = await Promise.all(map.sources.map(async sourceName => {
        try {
          return await fs.readFile(path.join(rootDir || "", sourceName), "utf-8");
        } catch (e) {
          return null;
        }
      }));
    }

    let stringifiedMap = JSON.stringify(map);
    return inlineMap ? generateInlineMap(stringifiedMap) : stringifiedMap;
  }

}
export function generateEmptyMap(sourceName, sourceContent, lineOffset = 0) {
  let map = new SourceMap();
  map.addEmptyMap(sourceName, sourceContent, lineOffset);
  return map;
}
