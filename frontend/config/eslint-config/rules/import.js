const importPlugin = require('eslint-plugin-import');

/** @type {(import('eslint').Linter.Config)[]} */
module.exports = [
  {
    files: ['**/*.?(m|c)?(j|t)s?(x)'],
    settings: {
      // TODO: Keep a configuration globally
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
      // TODO: At present, because edenx will dynamically generate some plug-in modules, an error will be reported when starting.
      // You need to fix the problem later, and start the following rules.
      // "import/no-unresolved": "error"
    },
  },
];
