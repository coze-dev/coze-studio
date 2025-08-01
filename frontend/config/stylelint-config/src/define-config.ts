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

import { type Config } from 'stylelint';

/**
 * Define an Lint config.
 *
 * @param config StyleLint config.
 * @returns StyleLint config.
 */
export const defineConfig = (config: Config): Config => {
  const { extends: rawExtends, rules = {}, ...userConfig } = config;

  return {
    // @ts-expect-error -- linter-disable-autofix
    extends: [path.resolve(__dirname, '../.stylelintrc.js'), ...rawExtends],
    rules: {
      ...rules,
    },
    ...userConfig,
  };
};
