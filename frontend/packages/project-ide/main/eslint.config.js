const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    'no-restricted-syntax': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    '@coze-arch/no-batch-import-or-export': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'rule-empty-line-before': 'off',
    'alpha-value-notation': 'off',
  },
});
