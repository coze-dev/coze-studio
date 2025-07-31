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

import path from 'path';
import fs from 'fs';

import type { Linter } from 'eslint';
import { includeIgnoreFile } from '@eslint/compat';

type ESLintConfigMode = 'web' | 'node' | 'base';

type ESLintConfig = Linter.Config;

type Rules = Linter.RulesRecord;

export interface EnhanceESLintConfig extends ESLintConfig {
  /**
   * project root dir
   */
  packageRoot: string;
  /**
   * config mode
   */
  preset: ESLintConfigMode;
  /** overrides config */
  overrides: ESLintConfig[];
}

/**
 * Define an ESLint config.
 *
 * @param config ESLint config.
 * @returns ESLint config.
 */
export const defineConfig = (config: EnhanceESLintConfig): ESLintConfig[] => {
  const {
    packageRoot,
    preset,
    overrides = [],
    ignores = [],
    rules,
    settings,

    ...userConfig
  } = config;

  if (!packageRoot) {
    throw new Error('should provider "packageRoot" params');
  }

  const defaultRules: Rules = {};

  const ignorePath = path.resolve(packageRoot, '.gitignore');

  return [
    ...require(`../eslint.config.${preset}.js`),

    fs.existsSync(ignorePath) ? includeIgnoreFile(ignorePath) : {},
    // root ignore file
    includeIgnoreFile(path.resolve(__dirname, '../../../.gitignore')),

    {
      ignores,
    },

    {
      files: ['**/*.?(m|c)?(j|t)s?(x)'],
      settings: {
        ...settings,
        'import/resolver': {
          typescript: {
            project: packageRoot,
          },
        },
      },
      plugins: {},
      rules: {
        ...defaultRules,
        ...rules,
      },
      ...userConfig,
    },
    ...overrides,
  ];
};
