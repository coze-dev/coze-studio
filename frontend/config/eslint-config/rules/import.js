const importPlugin = require('eslint-plugin-import');

/** @type {(import('eslint').Linter.Config)[]} */
module.exports = [
  {
    files: ['**/*.?(m|c)?(j|t)s?(x)'],
    settings: {
      // TODO: 全局保留一份配置
      'import/resolver': {
        node: {
          moduleDirectory: ['node_modules', 'src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'import/no-cycle': ['error', { ignoreExternal: true }],
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
      'import/no-relative-packages': 'error',
      'import/extensions': 'off',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            ['internal', 'parent', 'sibling', 'index'],
            'unknown',
          ],
          pathGroups: [
            {
              pattern: 'react*',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: './*.+(css|sass|less|scss|pcss|styl)',
              patternOptions: { dot: true, nocomment: true },
              group: 'unknown',
              position: 'after',
            },
          ],
          alphabetize: {
            order:
              'desc' /* sort in ascending order. Options: ['ignore', 'asc', 'desc'] */,
            caseInsensitive: true /* ignore case. Options: [true, false] */,
          },
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
        },
      ],
    },
  },
  {
    files: ['**/*.?(m|c)ts?(x)'],
    ...importPlugin.configs.typescript,
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // TODO: 目前由于 edenx 会动态生成一些插件模块，因此启动会报错
      // 后续需要修复问题，启动下述规则
      // "import/no-unresolved": "error"
    },
  },
];
