const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    '@coze-arch/max-line-per-function': [
      'error',
      {
        max: 300,
      },
    ],
    'no-restricted-imports': 'off',
  },
});
