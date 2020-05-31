// @flow
import type { VLQMap, SourceMapStringifyOptions } from "./types";

import path from "path";

export function generateInlineMap(map: string) {
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
) {
  let resultMap = { ...map };
  resultMap.version = 3;
  resultMap.file = file;
  resultMap.sourceRoot = sourceRoot;

  if (inlineSources && fs) {
    resultMap.sourcesContent = await Promise.all(
      resultMap.sources.map(async (sourceName) => {
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
    let stringifiedMap = JSON.stringify(resultMap);
    if (format === "inline") {
      return generateInlineMap(stringifiedMap);
    }
    return stringifiedMap;
  }

  return resultMap;
}
