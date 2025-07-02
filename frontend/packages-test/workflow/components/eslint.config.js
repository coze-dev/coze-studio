const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    'import/no-duplicates': 'off',
  },
  ignores: ['**/__tests__/**'],
});
