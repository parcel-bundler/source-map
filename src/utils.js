// @flow
import type { VLQMap, SourceMapStringifyOptions } from "./types";

import path from "path";

export function generateInlineMap(map: string): string {
  return `data:application/json;charset=utf-8;base64,${Buffer.from(
    map
  ).toString("base64")}`;
}

export async function partialVlqMapToSourceMap(
  map: VLQMap,
  {
    fs,
    file,
    sourceRoot,
    inlineSources,
    rootDir,
    format = "string",
  }: SourceMapStringifyOptions
): Promise<VLQMap | string> {
  map.version = 3;
  map.file = file;
  map.sourceRoot = sourceRoot;

  if (inlineSources && fs) {
    map.sourcesContent = await Promise.all(
      map.sources.map(async (sourceName) => {
        try {
          return await fs.readFile(
            path.resolve(rootDir || "", sourceName),
            "utf-8"
          );
        } catch (e) {
          return null;
        }
      })
    );
  }

  if (format === "inline" || format === "string") {
    let stringifiedMap = JSON.stringify(map);
    return format === "inline"
      ? generateInlineMap(stringifiedMap)
      : stringifiedMap;
  }

  return map;
}
