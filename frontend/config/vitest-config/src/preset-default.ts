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
 
import { coverageConfigDefaults, type UserConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export const defaultVitestConfig: UserConfig = {
  plugins: [tsconfigPaths()],
  resolve: {
    // 优先识别 main，如果没有配置 main，则识别 module
    mainFields: ['main', 'module', 'exports'],
  },
  server: {
    hmr: {
      port: undefined,
    },
  },
  test: {
    testTimeout: 10 * 1000,
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 32,
        minForks: 1,
      },
    },
    sequence: {
      // vitest 2.0之后，所有钩子默认串行运行
      hooks: 'parallel',
    },
    globals: true,
    mockReset: false,
    silent: process.env.CI === 'true',
    coverage: {
      // 逐步对各包开启
      all: false,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: coverageConfigDefaults.exclude,
      provider: 'v8',
      reporter: ['cobertura', 'text', 'html', 'clover', 'json', 'json-summary'],
    },
  },
};
