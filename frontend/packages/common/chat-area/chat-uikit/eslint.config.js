const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    '@coze-arch/no-deep-relative-import': 'off',
    '@coze-arch/no-batch-import-or-export': 'off',
    'no-restricted-syntax': 'off',
    'no-restricted-imports': 'off',
  },
});
