const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'node',
  overrides: [
    {
      files: ['**/__tests__/**/*.{js,ts,jsx,tsx}', '**/*.test.{js,ts,jsx,tsx}'],
      rules: {
        '@coze-arch/no-deep-relative-import': 'off',
        '@typescript-eslint/consistent-type-assertions': 'off',
      },
    },
  ],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    'import/no-duplicates': 'off',
  },
});
