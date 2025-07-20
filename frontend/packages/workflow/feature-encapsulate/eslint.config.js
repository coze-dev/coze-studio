const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  preset: 'web',
  packageRoot: __dirname,
  rules: {
    '@typescript-eslint/naming-convention': 0,
    '@coze-arch/no-batch-import-or-export': 0,
    'import/no-duplicates': 'off',
  },
});
