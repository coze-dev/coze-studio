const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  preset: 'node',
  packageRoot: __dirname,
  overrides: [
    {
      files: ['__tests__/**'],
      rules: {
        '@coze-arch/package-require-author': 'off',
        'unicorn/filename-case': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/consistent-type-assertions': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
});
