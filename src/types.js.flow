// @flow
export type MappingPosition = {|
  line: number,
  column: number
|};

export type IndexedMapping<T> = {
  generated: MappingPosition,
  original?: MappingPosition,
  source?: T,
  name?: T,
  ...
};

export type ParsedMap = {|
  sources: Array<string>,
  names: Array<string>,
  mappings: Array<IndexedMapping<number>>
|};

export type VLQMap = {
  sources: Array<string>,
  names: Array<string>,
  mappings: string,
  version?: number,
  file?: string,
  sourceRoot?: string,
  sourcesContent?: Array<any>,
  ...
};

export type SourceMapStringifyOptions = {
  file?: string,
  sourceRoot?: string,
  rootDir?: string,
  inlineSources?: boolean,
  fs?: any,
  format?: "inline" | "string" | "object",

  // !Deprecated
  inlineMap?: boolean,
  ...
};
