import path from 'path';
import fs from 'fs';

import { type Compiler } from 'webpack';
import json5 from 'json5';

const toAbsolute = (root: string, file: string) => {
  if (fs.existsSync(path.join(root, 'src'))) {
    return path.join(root, 'src', file);
  }
  return path.join(root, file);
};

interface PkgRootWebpackPluginOptions {
  // 根目录符号，默认为 `@`
  root?: string;
  // 需要排除的packages根目录
  excludeFolders?: string[];
}

class PkgRootWebpackPlugin {
  private options: PkgRootWebpackPluginOptions;
  rootFolders: string[]; // 需要进行转化的项目根目录，如packages/card-builder，默认值为全量rush.json里的路径

  constructor(options?: Partial<PkgRootWebpackPluginOptions>) {
    const rootDir = path.resolve(__dirname, '../../../../../');

    const rushJsonPath = path.resolve(rootDir, 'rush.json');
    const rushJsonStr = fs.readFileSync(rushJsonPath, 'utf-8');
    const rushJson = json5.parse(rushJsonStr);
    const rushJsonPackagesDir = rushJson.projects.map(
      item => item.projectFolder,
    );

    this.rootFolders = rushJsonPackagesDir;
    this.options = {
      root: '@',
      // 排除apps/*，减少处理时间
      excludeFolders: fs
        .readdirSync(path.resolve(rootDir, 'frontend/apps'))
        .map(folder => `frontend/apps/${folder}`),
      ...(options || {}),
    };
  }

  apply(compiler: Compiler) {
    const target = compiler.hooks.normalModuleFactory;
    target.tap('PkgRootWebpackPlugin', nmf => {
      nmf.hooks.beforeResolve.tapAsync(
        'PkgRootWebpackPlugin',
        (request, callback) => {
          const innerRequest = request.request;

          if (!innerRequest) {
            return callback();
          }
          const { root, excludeFolders = [] } = this.options;
          const { context } = request;
          if (innerRequest.startsWith(`${root}/`)) {
            const folder = this.rootFolders.find(
              fold =>
                context.indexOf(fold) !== -1 && !excludeFolders.includes(fold),
            );
            if (!folder) {
              return callback();
            }
            const absolutePath = toAbsolute(
              context.slice(0, context.indexOf(folder) + folder.length),
              // @ts-expect-error -- linter-disable-autofix
              innerRequest.slice(root.length),
            );
            request.request = absolutePath;
          }
          return callback();
        },
      );
    });
  }
}

export default PkgRootWebpackPlugin;

export { PkgRootWebpackPlugin };
