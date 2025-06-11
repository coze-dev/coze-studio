const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {},
  languageOptions: {
    globals: {
      DataItem: true,
    },
  },
});
