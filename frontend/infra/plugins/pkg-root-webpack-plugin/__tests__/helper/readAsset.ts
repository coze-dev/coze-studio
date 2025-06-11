import path from 'path';

import type { Compiler, Stats } from 'webpack';

export default (
  asset: string,
  compiler: Compiler,
  stats: Stats,
): Promise<string> => {
  const usedFs = compiler.outputFileSystem;
  const outputPath = stats.compilation.outputOptions.path;

  let targetFile = asset;

  const queryStringIdx = targetFile.indexOf('?');

  if (queryStringIdx >= 0) {
    targetFile = targetFile.substr(0, queryStringIdx);
  }

  return new Promise((r, j) => {
    usedFs.readFile(path.join(outputPath, targetFile), (error, res) => {
      if (error) {
        j(error);
      } else {
        r(res?.toString() as string);
      }
    });
  });
};
