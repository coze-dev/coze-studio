import { jsonParser } from './processors/json';
import { disallowDepRule } from './rules/package-disallow-deps';
import { noDeepRelativeImportRule } from './rules/no-deep-relative-import';
import { noDuplicatedDepsRule } from './rules/no-duplicated-deps';
import { requireAuthorRule } from './rules/package-require-author';
import { maxLinePerFunctionRule } from './rules/max-lines-per-function';
import { noNewErrorRule } from './rules/no-new-error';
import { noBatchImportOrExportRule } from './rules/no-batch-import-or-export';
import { useErrorInCatch } from './rules/use-error-in-catch';
import { noEmptyCatch } from './rules/no-empty-catch';
import { noPkgDirImport } from './rules/no-pkg-dir-import';
import { tsxNoLeakedRender } from './rules/tsx-no-leaked-render';

export const flowPreset = {
  rules: {
    'package-require-author': requireAuthorRule,
    'package-disallow-deps': disallowDepRule,
    'no-deep-relative-import': noDeepRelativeImportRule,
    'no-duplicated-deps': noDuplicatedDepsRule,
    'max-line-per-function': maxLinePerFunctionRule,
    'no-new-error': noNewErrorRule,
    'no-batch-import-or-export': noBatchImportOrExportRule,
    'no-empty-catch': noEmptyCatch,
    'use-error-in-catch': useErrorInCatch,
    'no-pkg-dir-import': noPkgDirImport,
    'tsx-no-leaked-render': tsxNoLeakedRender,
  },
  configs: {
    recommended: [
      {
        rules: {
          '@coze-arch/tsx-no-leaked-render': 'warn',
          '@coze-arch/no-pkg-dir-import': 'error',
          '@coze-arch/no-duplicated-deps': 'error',
          // 不允许超过 4 层的相对应用
          '@coze-arch/no-deep-relative-import': [
            'error',
            {
              max: 4,
            },
          ],
          '@coze-arch/package-require-author': 'error',
          // 函数代码行不要超过 150
          '@coze-arch/max-line-per-function': [
            'error',
            {
              max: 150,
            },
          ],
          '@coze-arch/no-new-error': 'off',
          '@coze-arch/no-batch-import-or-export': 'error',
          '@coze-arch/no-empty-catch': 'error',
          '@coze-arch/use-error-in-catch': 'warn',
        },
      },
      {
        files: ['package.json'],
        processor: '@coze-arch/json-processor',
        rules: {
          // TODO: 需要重构为直接解析json，否则全局规则都会对processor处理后的文件`package.js`生效.
          //https://github.com/eslint/json
          '@coze-arch/package-require-author': 'error',
          '@coze-arch/package-disallow-deps': 'error',
          // 关闭prettier规则，因为该规则lint package.js存在bug
          'prettier/prettier': 'off',
        },
      },
    ],
  },
  processors: {
    'json-processor': jsonParser,
  },
};
