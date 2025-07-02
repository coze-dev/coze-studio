const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'node',
  rules: {
    'unicorn/filename-case': 0,
  },
  overrides: [
    {
      files: ['src/idl/*.ts'],
      rules: {
        '@coze-arch/no-batch-import-or-export': 0,
      },
    },
  ],
});
