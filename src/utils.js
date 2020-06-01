// @flow
import type { VLQMap, SourceMapStringifyOptions } from "./types";

import path from "path";

export function generateInlineMap(map: string) {
  return `data:application/json;charset=utf-8;base64,${Buffer.from(
    map
  ).toString("base64")}`;
}

function normalisePath(filepath: string): string {
  return filepath.replace(/\\/g, "/");
}

function relatifyPath(filepath: string, rootDir: string): string {
  // Sourcemaps are made for web, so replace backslashes with regular slashes
  filepath = normalisePath(filepath);

  // Make root paths relative to the rootDir
  if (filepath[0] === "/") {
    filepath = normalisePath(path.relative(rootDir, filepath));
  }

  // Prefix relative paths with ./ as it makes it more clear and probably prevents issues
  if (filepath[0] !== ".") {
    filepath = `./${filepath}`;
  }

  return filepath;
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
  let root = normalisePath(rootDir || "/");
  let resultMap = {
    ...map,
    version: 3,
    file,
    sourceRoot,
  };

  resultMap.sources = resultMap.sources.map((sourceFilePath) => {
    return relatifyPath(sourceFilePath, root);
  });

  if (inlineSources && fs) {
    resultMap.sourcesContent = await Promise.all(
      resultMap.sources.map(async (sourceName) => {
        try {
          return await fs.readFile(path.resolve(root, sourceName), "utf-8");
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
