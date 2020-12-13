// @flow
import type { VLQMap, SourceMapStringifyOptions } from './types';

import path from 'path';

// For some reason path.isAbsolute barely works... Regex to the rescue?
// Apparently windows stuff is under `path.win32`, so yeah windows makes stuff complicated :)
const ABSOLUTE_PATH_REGEX = /^([a-zA-Z]:){0,1}[\\/]+/;
const PATH_SEPARATOR_REGEX = /\\/g;

export function generateInlineMap(map: string): string {
  return `data:application/json;charset=utf-8;base64,${Buffer.from(map).toString('base64')}`;
}

export function isAbsolute(filepath: string): boolean {
  return ABSOLUTE_PATH_REGEX.test(filepath);
}

export function normalizePath(filepath: string): string {
  if (process.platform === 'win32') {
    return filepath.replace(ABSOLUTE_PATH_REGEX, '/').replace(PATH_SEPARATOR_REGEX, '/');
  }

  return filepath;
}

export function relatifyPath(filepath: string, rootDir: string): string {
  rootDir = normalizePath(rootDir);
  filepath = normalizePath(filepath);

  // Make root paths relative to the rootDir
  if (filepath[0] === '/') {
    filepath = path.relative(rootDir, filepath);
  }

  // Prefix relative paths with ./ as it makes it more clear and probably prevents issues
  if (filepath[0] !== '.') {
    filepath = `./${filepath}`;
  }

  // Sourcemaps are made for web, so replace backslashes with regular slashes
  return normalizePath(filepath);
}

export async function partialVlqMapToSourceMap(
  map: VLQMap,
  { fs, file, sourceRoot, inlineSources, rootDir, format = 'string' }: SourceMapStringifyOptions
): Promise<VLQMap | string> {
  let resultMap = {
    ...map,
    sourcesContent: map.sourcesContent ? map.sourcesContent.map((content) => (content ? content : null)) : [],
    version: 3,
    file,
    sourceRoot,
  };

  if (resultMap.sourcesContent.length < resultMap.sources.length) {
    resultMap.sourcesContent.push(...new Array(resultMap.sources.length - resultMap.sourcesContent.length).fill(null));
  }

  if (fs) {
    resultMap.sourcesContent = await Promise.all(
      resultMap.sourcesContent.map(async (content, index): Promise<string | null> => {
        let sourceName = map.sources[index];
        // If sourceName starts with `..` it is outside rootDir, in this case we likely cannot access this file from the browser or packaged node_module
        // Because of this we have to include the sourceContent to ensure you can always see the sourcecontent for each mapping.
        if (!content && (inlineSources || sourceName.startsWith('..'))) {
          try {
            return await fs.readFile(path.resolve(rootDir || '/', sourceName), 'utf-8');
          } catch (e) {}
        }

        return content;
      })
    );
  }

  if (format === 'inline' || format === 'string') {
    let stringifiedMap = JSON.stringify(resultMap);
    if (format === 'inline') {
      return generateInlineMap(stringifiedMap);
    }
    return stringifiedMap;
  }

  return resultMap;
}
