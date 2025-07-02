const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'node',
  rules: {
    '@coze-arch/no-batch-import-or-export': 'off',
    'unicorn/filename-case': 'off',
  },
  ignores: ['src/idl/**/*.ts', 'src/**/*.js'],
});
