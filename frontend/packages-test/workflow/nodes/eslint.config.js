const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    '@typescript-eslint/no-redeclare': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@coze-arch/no-batch-import-or-export': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-restricted-syntax': 'off',
    'no-inner-declarations': 'off',
    'import/no-duplicates': 'off',
    'max-params': 'off',
  },
});
