const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    '@coze-arch/max-line-per-function': 'off',
    'import/no-duplicates': 'off',
  },
  ignores: ['dist', 'node_modules'],
});
