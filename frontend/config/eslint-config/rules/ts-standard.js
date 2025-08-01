/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @type {(import('eslint').Linter.Config)[]} */
module.exports = [
  {
    files: ['**/*.?(m|c)ts?(x)'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/prefer-namespace-keyword': 'off',
      '@typescript-eslint/dot-notation': 'error',
      '@typescript-eslint/require-await': 'error',

      'max-lines': [
        'error',
        {
          max: 500,
          skipComments: true,
          skipBlankLines: true,
        },
      ],
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-literal-enum-member': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/method-signature-style': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
        },
      ],
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-invalid-void-type': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'none', // function arguments should not force to match this rule.
          argsIgnorePattern: '^_', // Specifications allow underlining
          ignoreRestSiblings: true, //Use rest syntax (such as'var {foo,... rest} = data ') to ignore foo.
          destructuredArrayIgnorePattern: '^_', //Structural arrays allow _
          caughtErrors: 'none',
          // "caughtErrorsIgnorePattern": "^e$"
        },
      ],
      '@stylistic/ts/quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
      '@typescript-eslint/no-magic-numbers': [
        'warn',
        {
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          enforceConst: true,
          ignore: [-1, 0, 1],
          ignoreTypeIndexes: true,
          ignoreReadonlyClassProperties: true,
          ignoreClassFieldInitialValues: true,
        },
      ],
      '@stylistic/ts/no-extra-semi': 'error',
      '@typescript-eslint/no-dupe-class-members': 'error',
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/default-param-last': 'error',
      '@typescript-eslint/no-loss-of-precision': 'error',
      '@stylistic/ts/comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          enums: 'always-multiline',
          generics: 'ignore',
          tuples: 'always-multiline',
          functions: 'always-multiline',
        },
      ],
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-extraneous-class': 'error',
      'no-import-assign': 'off',
      'no-undef': 'off',
      'dot-notation': 'off',
      'constructor-super': 'off',
      'no-this-before-super': 'off',
      'getter-return': 'off',
      'no-setter-return': 'off',
      'no-func-assign': 'off',
      'no-unsafe-negation': 'off',
      'valid-typeof': 'off',
      'no-unreachable': 'off',
      'no-throw-literal': 'off',
      'no-implied-eval': 'off',
      'no-new-symbol': 'off',
      'no-obj-calls': 'off',
      camelcase: 'off',
      'no-const-assign': 'off',
      'no-dupe-args': 'off',
      'no-dupe-class-members': 'off',
      'no-dupe-keys': 'off',
      'no-redeclare': 'off',
      'no-array-constructor': 'off',
      'no-empty-function': 'off',
      'no-extra-semi': 'off',
      'no-loss-of-precision': 'off',
      'no-unused-vars': 'off',
      'default-param-last': 'off',
      'no-useless-constructor': 'off',
      quotes: 'off',
      'comma-dangle': 'off',
      indent: 'off',
      'no-magic-numbers': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['default', 'variableLike'],
          format: ['camelCase', 'UPPER_CASE'],
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
          format: ['camelCase', 'snake_case'],
        },
        {
          selector: 'function',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
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
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
          },
        },
      ],
      'max-lines-per-function': [
        'warn',
        {
          max: 120,
          IIFEs: true,
        },
      ],
    },
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 11,
        projectService: true,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
          legacyDecorators: true,
        },
      },
    },
  },
  {
    files: ['**/*.?(m|c)tsx'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['default', 'variableLike'],
          format: ['camelCase', 'UPPER_CASE'],
        },
        {
          selector: ['class', 'interface', 'typeLike'],
          format: ['PascalCase'],
        },
        {
          selector: ['variable'],
          format: ['UPPER_CASE', 'camelCase', 'PascalCase'],
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
          format: ['camelCase', 'snake_case'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'parameter',
          format: ['camelCase', 'snake_case'],
          modifiers: ['destructured'],
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
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
      ],
      'unicorn/filename-case': [
        'warn',
        {
          cases: {
            kebabCase: true,
            snakeCase: true,
            pascalCase: true,
          },
          ignore: ['^(?!.*?\\.jsx$)(?!.*?\\.tsx$).+'],
        },
      ],
      'max-lines-per-function': [
        'warn',
        {
          max: 300,
          IIFEs: true,
        },
      ],
    },
  },

  // TODO: The content of overides before can be considered to be directly integrated into the above standard configuration later
  {
    files: ['**/*.?(m|c)ts?(x)'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
        },
      ],
      // These rules are copied and migrated from packages/config/.eslintrc.react.js
      // Adjustments are being made later.
      '@typescript-eslint/no-redundant-type-constituents': 0,
      '@typescript-eslint/no-throw-literal': 'off',
      '@typescript-eslint/no-unnecessary-condition': 0,
      '@typescript-eslint/prefer-optional-chain': 0,
      '@typescript-eslint/indent': 0,
      '@babel/new-cap': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      // TODO: Follow-up opening
      // 'import/no-cycle': 'error',

      '@typescript-eslint/prefer-string-starts-ends-with': 0,
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 0,
      '@typescript-eslint/no-implied-eval': 0, // warning

      // TODO: Open the following configurations
      // fix: https://stackoverflow.com/questions/63961803/eslint-says-all-enums-in-typescript-app-are-already-declared-in-the-upper-scope
      // 'no-shadow': 'off',
      // '@typescript-eslint/no-shadow': ['error'],
      // '@typescript-eslint/consistent-type-imports': [
      //   'error',
      //   {
      //     fixStyle: 'inline-type-imports',
      //   },
      // ],
      // according to: https://typescript-eslint.io/linting/troubleshooting/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      // 'no-undef': 'off',
      // 'no-unused-vars': 'off',
      // '@typescript-eslint/no-unused-vars': [
      //   'error',
      //   {
      //     vars: 'all',
      //     args: 'none', // function arguments should not force to match this rule.
      //     ignoreRestSiblings: false,
      //   },
      // ],
      // complexity: ['error', { max: 15 }],
      // After using CustomError uniformly later, open it again.
      '@coze-arch/no-new-error': 'off',
    },
  },
];
