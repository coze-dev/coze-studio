import path, { relative } from 'path';
import { Rule } from 'eslint';
import readPkgUp from 'eslint-module-utils/readPkgUp';
import resolve from 'eslint-module-utils/resolve';
import { exportPathMatch } from './utils';

export const noPkgDirImport: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'limit import package directory directly',
    },
    messages: {
      invalidSubpath:
        'subPath `{{ subPath }}` is NOT exported in `{{ pkg }}`, you can config the `exports` fields in package.json',
      noExportsCfg:
        "NO `exports` fields config in `{{ pkg }}` package.json, you can't import by subPath ",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = `${node.source.value}`;
        const modulePath = resolve(importPath, context);

        if (!modulePath) {
          // 解析不到的情况，暂不处理
          return;
        }

        const { pkg, path: importPkgPath } = readPkgUp({
          cwd: modulePath,
        }) as any;

        const { path: currentPkgPath } = readPkgUp({
          cwd: context.filename,
        }) as any;

        if (!pkg.name) {
          return;
        }

        // 本地link会解析到node_modules目录，需要拿到pkg name再次解析。
        const moduleRealPath = resolve(pkg.name, context);

        if (
          // 包名称就是引用路径
          pkg.name === importPath ||
          // 解析到其他包，如@type
          !importPath.startsWith(pkg.name) ||
          // 解析到自己包的文件
          currentPkgPath === importPkgPath ||
          !moduleRealPath ||
          moduleRealPath.includes('node_modules')
        ) {
          return;
        }

        if (!pkg.exports) {
          context.report({
            messageId: 'noExportsCfg',
            data: {
              pkg: pkg.name,
            },
            // @ts-expect-error -- linter-disable-autofix
            loc: node.loc,
          });
        } else if (pkg.exports) {
          if (typeof pkg.exports === 'string') {
            context.report({
              messageId: 'noExportsCfg',
              data: {
                pkg: pkg.name,
              },
              // @ts-expect-error -- linter-disable-autofix
              loc: node.loc,
            });
            return;
          }
          const validSubPath = Object.keys(pkg.exports);
          if (
            !validSubPath.some(p => {
              const pkgExportPath = path.join(pkg.name, p);
              return exportPathMatch(importPath, pkgExportPath);
            })
          ) {
            const subPath = relative(pkg.name, importPath);
            context.report({
              messageId: 'invalidSubpath',
              data: {
                subPath,
                pkg: pkg.name,
              },
              // @ts-expect-error -- linter-disable-autofix
              loc: node.loc,
            });
          }
        }
      },
    };
  },
};
