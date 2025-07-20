const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'node',
  rules: {
    'import/no-duplicates': 'off',
  },
});
