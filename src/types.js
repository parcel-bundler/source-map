// @flow
export type MappingPosition = {|
  line: number,
  column: number,
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
  mappings: Array<IndexedMapping<number>>,
  sourcesContent: Array<string | null>,
|};

export type VLQMap = {
  sources: Array<string>,
  sourcesContent: Array<string | null>,
  names: Array<string>,
  mappings: string,
  version?: number,
  file?: string,
  sourceRoot?: string,
  ...
};

export type SourceMapStringifyOptions = {
  file?: string,
  sourceRoot?: string,
  rootDir?: string,
  inlineSources?: boolean,
  fs?: any,
  format?: 'inline' | 'string' | 'object',
  ...
};
