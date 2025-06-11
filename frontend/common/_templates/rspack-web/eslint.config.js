const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  preset: 'web',
  packageRoot: __dirname,
  rules: {
    'xss/no-mixed-html': 'off',
  },
});
