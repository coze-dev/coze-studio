/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
          // If it cannot be resolved, it will not be dealt with for the time being.
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

        // The local link will resolve to the node_modules directory, and you need to get the pkg name to resolve it again.
        const moduleRealPath = resolve(pkg.name, context);

        if (
          // The package name is the reference path
          pkg.name === importPath ||
          // Parse to other packages, such as @type
          !importPath.startsWith(pkg.name) ||
          // Parse to the file of your own package
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
