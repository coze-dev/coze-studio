const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    '@typescript-eslint/no-redeclare': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-cycle': 'off',
    'no-restricted-syntax': 'off',
    'no-inner-declarations': 'off',
  },
});
