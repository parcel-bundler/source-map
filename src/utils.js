// @flow
import type { VLQMap, SourceMapStringifyOptions } from './types';

import path from 'path';

export function generateInlineMap(map: string): string {
  return `data:application/json;charset=utf-8;base64,${Buffer.from(map).toString('base64')}`;
}

function normalisePath(filepath: string): string {
  return filepath.replace(/\\/g, '/');
}

function relatifyPath(filepath: string, rootDir: string): string {
  // Sourcemaps are made for web, so replace backslashes with regular slashes
  filepath = normalisePath(filepath);

  // Make root paths relative to the rootDir
  if (filepath[0] === '/') {
    filepath = normalisePath(path.relative(rootDir, filepath));
  }

  // Prefix relative paths with ./ as it makes it more clear and probably prevents issues
  if (filepath[0] !== '.') {
    filepath = `./${filepath}`;
  }

  return filepath;
}

export async function partialVlqMapToSourceMap(
  map: VLQMap,
  { fs, file, sourceRoot, inlineSources, rootDir, format = 'string' }: SourceMapStringifyOptions
): Promise<VLQMap | string> {
  let root = normalisePath(rootDir || '/');
  let resultMap = {
    ...map,
    sourcesContent: map.sourcesContent ? map.sourcesContent.map((content) => (content ? content : null)) : [],
    version: 3,
    file,
    sourceRoot,
  };

  resultMap.sources = resultMap.sources.map((sourceFilePath) => {
    return relatifyPath(sourceFilePath, root);
  });

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
            return await fs.readFile(path.resolve(root, sourceName), 'utf-8');
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
