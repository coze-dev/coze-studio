const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'node',
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    'unicorn/filename-case': 'off',
    '@coze-arch/no-batch-import-or-export': 'off',
    'max-statements-per-line': 'off',
    'max-lines': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@coze-arch/max-line-per-function': 'off',
  },
});
