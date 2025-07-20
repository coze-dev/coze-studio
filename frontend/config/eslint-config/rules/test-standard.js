const globals = require('globals');

/** @type {(import('eslint').Linter.Config)[]} */
module.exports = [
  {
    files: [
      '**/*.{test,spec}.?(m|c){js,ts}?(x)',
      '**/{tests,__tests__,__test__}/**/*.?(m|c){js,ts}?(x)',
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        vi: 'readonly',
      },
    },
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'no-magic-numbers': 'off',
      'no-restricted-syntax': 'off',
      'import/no-named-as-default-member': 'off',
      '@coze-arch/max-line-per-function': 'off',
      '@coze-arch/no-deep-relative-import': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
    },
  },
  {
    files: [
      '**/*.{test,spec}.?(m|c)ts?(x)',
      '**/{tests,__tests__,__test__}/**/*.?(m|c)ts?(x)',
    ],
    rules: {
      '@stylistic/ts/member-delimiter-style': [
        'warn',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@coze-arch/no-batch-import-or-export': 'off',
    },
  },
];
