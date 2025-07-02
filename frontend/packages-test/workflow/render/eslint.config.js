const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    'no-restricted-syntax': 'off',
    'import/no-duplicates': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    '@coze-arch/no-batch-import-or-export': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
});
