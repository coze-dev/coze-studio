const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    // FIXME
    '@typescript-eslint/consistent-type-imports': 0,
    'no-restricted-syntax': 0,
    'no-restricted-imports': 'off',
  },
});
