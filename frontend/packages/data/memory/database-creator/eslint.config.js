const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'max-lines': 'off',
    'max-lines-per-function': 'off',
    '@coze-arch/max-line-per-function': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@coze-arch/no-deep-relative-import': 'warn',
    '@typescript-eslint/no-namespace': [
      'error',
      {
        allowDeclarations: true,
      },
    ],
  },
  overrides: [
    {
      files: ['src/**/namespaces/*.ts'],
      rules: {
        'unicorn/filename-case': 'off',
      },
    },
  ],
});
