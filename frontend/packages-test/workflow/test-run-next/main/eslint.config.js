const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    '@coze-arch/max-line-per-function': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@coze-arch/zustand/prefer-shallow': 'off',
    '@coze-arch/no-deep-relative-import': 'off',
    '@typescript-eslint/naming-convention': 'off',
  },
});
