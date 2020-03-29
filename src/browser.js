// @flow
import type {
  ParsedMap,
  VLQMap,
  SourceMapStringifyOptions,
  IndexedMapping
} from "./types";

import path from "path";
import * as vlq from "vlq";

import {
  generateInlineMap,
  partialVlqMapToSourceMap,
  countLines
} from "./utils";
import MappingLine from "./MappingLine";

export default class SourceMap {
  namesMap: Map<string, number>;
  sourcesMap: Map<string, number>;
  names: Array<string>;
  sources: Array<string>;
  mappingLines: Array<MappingLine>;

  constructor() {
    this.namesMap = new Map();
    this.sourcesMap = new Map();
    this.names = [];
    this.sources = [];
    this.mappingLines = [];
  }

  // TODO: Change API so it accepts lineCount instead of sourceContent as we currently don't store sourceContent anyway...
  static generateEmptyMap(
    sourceName: string,
    sourceContent: string,
    lineOffset: number = 0
  ): SourceMap {
    let map = new SourceMap();
    return map.addEmptyMap(sourceName, sourceContent, lineOffset);
  }

  addEmptyMap(
    sourceName: string,
    sourceContent: string,
    lineOffset: number = 0
  ): SourceMap {
    let sourceIndex = this._addSource(sourceName);
    let lines = countLines(sourceContent);
    for (let i = 0; i < lines; i++) {
      this._addMapping({
        original: {
          line: i,
          column: 0
        },
        generated: {
          line: i + lineOffset,
          column: 0
        },
        source: sourceIndex
      });
    }
    return this;
  }

  addRawMappings(
    mappings: string,
    sources: Array<string> = [],
    names: Array<string> = [],
    lineOffset: number = 0,
    columnOffset: number = 0
  ): SourceMap {
    let sourceIndexes = this.addSources(sources);
    let nameIndexes = this.addNames(names);
    let vlqs = mappings.split(";").map(line => line.split(","));

    let generatedLine = lineOffset;
    let segments = [0, 0, 0, 0, 0];
    for (let line of vlqs) {
      segments[0] = 0;

      for (let vlqmapping of line) {
        let decoded = vlq.decode(vlqmapping);
        segments[0] += decoded[0];
        segments[1] += decoded[1];

        if (decoded.length > 2) {
          segments[2] += decoded[2];
          segments[3] += decoded[3];
        }

        if (decoded.length > 4) {
          segments[4] += decoded[4];
        }

        this._addMapping({
          generated: {
            line: generatedLine,
            column: segments[0]
          },
          original:
            decoded.length > 2
              ? {
                  line: segments[2],
                  column: segments[3]
                }
              : undefined,
          source: segments[1],
          name: decoded.length > 4 ? segments[4] : undefined
        });
      }

      generatedLine++;
    }

    return this;
  }

  addBufferMappings(
    buffer: Buffer,
    lineOffset: number = 0,
    columnOffset: number = 0
  ): SourceMap {
    return this;
  }

  _addLine() {
    this.mappingLines.push(new MappingLine(this.mappingLines.length - 1));
  }

  _addMapping(mapping: IndexedMapping<number>) {
    let line = mapping.generated.line;
    while (line >= this.mappingLines.length) {
      this._addLine();
    }
    this.mappingLines[line].addMapping(mapping);
  }

  // line numbers start at 1 so we have the same api as `source-map` by mozilla
  addIndexedMappings(
    mappings: Array<IndexedMapping<number | string>>,
    lineOffset?: number = 0,
    columnOffset?: number = 0
  ): SourceMap {
    for (let mapping of mappings) {
      this._addMapping({
        original: mapping.original,
        generated: {
          line: mapping.generated.line + lineOffset,
          column: mapping.generated.column + columnOffset
        },
        source:
          mapping.source == null || typeof mapping.source === "number"
            ? mapping.source
            : this._addSource(mapping.source),
        name:
          mapping.name == null || typeof mapping.name === "number"
            ? mapping.name
            : this._addName(mapping.name)
      });
    }

    return this;
  }

  _addName(name: string): number {
    let index = this.getSourceIndex(name);
    if (index < 0) {
      index = this.names.push(name) - 1;
      this.namesMap.set(name, index);
    }
    return index;
  }

  addNames(names: Array<string>): Array<number> {
    return names.map(name => this._addName(name));
  }

  _addSource(source: string): number {
    let index = this.getSourceIndex(source);
    if (index < 0) {
      index = this.sources.push(source) - 1;
      this.sourcesMap.set(source, index);
    }
    return index;
  }

  addSources(sources: Array<string>): Array<number> {
    return sources.map(source => this._addSource(source));
  }

  getSourceIndex(source: string): number {
    let foundIndex = this.sourcesMap.get(source);
    if (foundIndex) {
      return foundIndex;
    }
    return -1;
  }

  getNameIndex(name: string): number {
    let foundIndex = this.namesMap.get(name);
    if (foundIndex) {
      return foundIndex;
    }
    return -1;
  }

  findClosestMapping(line: number, column: number): IndexedMapping<number> {
    return {};
  }

  // Remaps original positions from this map to the ones in the provided map
  extends(buffer: Buffer): SourceMap {
    return this;
  }

  getMap(): ParsedMap {
    return {
      sources: this.sources,
      names: this.names,
      mappings: []
    };
  }

  toBuffer(): Buffer {
    return new Buffer("");
  }

  toVLQ(): VLQMap {
    let previousGeneratedColumn = 0;
    let previousSource = 0;
    let previousOriginal = { line: 0, column: 0 };
    let previousName = 0;
    let mappings = "";

    for (let line of this.mappingLines) {
      for (let mapping of line.mappings) {
        mappings += vlq.encode(
          mapping.generated.column - previousGeneratedColumn
        );
        previousGeneratedColumn = mapping.generated.column;

        if (mapping.source != null) {
          // $FlowFixMe
          mappings += vlq.encode(mapping.source - previousSource);
          // $FlowFixMe
          mappings += vlq.encode(mapping.original.line - previousOriginal.line);
          mappings += vlq.encode(
            // $FlowFixMe
            mapping.original.column - previousOriginal.column
          );

          previousOriginal = mapping.original;
          previousSource = mapping.source;
        }

        if (mapping.name != null) {
          // $FlowFixMe
          mappings += vlq.encode(mapping.name - previousName);
          previousName = mapping.name;
        }

        mappings += ",";
      }

      if (line.mappings.length) {
        mappings = mappings.slice(0, -1);
      }

      previousGeneratedColumn = 0;
      mappings += ";";
    }

    mappings = mappings.slice(0, -1);

    return {
      sources: this.sources,
      names: this.names,
      mappings
    };
  }

  async stringify(options: SourceMapStringifyOptions) {
    return partialVlqMapToSourceMap(this.toVLQ(), options);
  }
}
