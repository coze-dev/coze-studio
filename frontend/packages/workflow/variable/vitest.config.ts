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

import { resolve } from 'path';

import { defineConfig } from '@coze-arch/vitest-config';

const alias = {
  '@coze-workflow/render': resolve('./__tests__/default.mock.ts'),
  '@coze-workflow/components': resolve('./__tests__/default.mock.ts'),
  '@coze-arch/bot-icons': resolve('./__tests__/default.mock.ts'),
  '@coze-studio/bot-detail-store/page-runtime': resolve(
    './__tests__/default.mock.ts',
  ),
  '@coze-studio/bot-detail-store/bot-info': resolve(
    './__tests__/default.mock.ts',
  ),
  '@coze-studio/bot-detail-store/bot-skill': resolve(
    './__tests__/default.mock.ts',
  ),
  '@coze-studio/bot-detail-store': resolve('./__tests__/default.mock.ts'),
};

const esbuild = {
  tsconfigRaw: {
    compilerOptions: {
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
  },
};

export default defineConfig(
  {
    dirname: __dirname,
    preset: 'web',
    esbuild,
    test: {
      setupFiles: ['./__tests__/setup.ts'],
      onConsoleLog: (log: string, type: 'stdout' | 'stderr') =>
        type === 'stdout',

      alias,
    },
  },
  {
    fixSemi: true,
  },
);
