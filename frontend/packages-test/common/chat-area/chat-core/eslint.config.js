const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: ['default', 'variableLike'],
            format: ['camelCase', 'UPPER_CASE', 'snake_case', 'PascalCase'],
          },
          {
            selector: ['class', 'interface', 'typeLike'],
            format: ['PascalCase'],
          },
          {
            selector: ['variable'],
            format: ['UPPER_CASE', 'camelCase'],
            modifiers: ['global', 'exported'],
          },
          {
            selector: 'objectLiteralProperty',
            format: null,
          },
          {
            selector: 'enumMember',
            format: ['UPPER_CASE', 'PascalCase'],
          },
          {
            selector: 'typeProperty',
            format: ['camelCase', 'snake_case', 'PascalCase'],
          },
          {
            selector: 'function',
            format: ['camelCase'],
            leadingUnderscore: 'forbid',
            trailingUnderscore: 'forbid',
          },
          {
            selector: 'parameter',
            format: ['camelCase', 'snake_case', 'PascalCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'forbid',
          },
          {
            selector: 'variable',
            modifiers: ['destructured'],
            format: [
              'camelCase',
              'PascalCase',
              'snake_case',
              'strictCamelCase',
              'StrictPascalCase',
              'UPPER_CASE',
            ],
          },
          {
            selector: 'import',
            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          },
        ],
      },
    },
  ],
});
