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

import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig(
  {
    dirname: __dirname,
    preset: 'web',
    test: {
      coverage: {
        provider: 'v8',
        all: true,
        include: ['src'],
        exclude: [
          'src/index.tsx',
          'src/hook/table/**',
          'src/global.d.ts',
          'src/typings.d.ts',
          'src/component/**',
          'src/page/**',
          'src/demo/**',
          'src/hook/index.ts',
          'src/util/index.ts',
          'src/util/editor.ts',
          'src/hook/example/**',
        ],
      },
      setupFiles: ['./__tests__/setup.ts'],
    },
  },
  {
    fixSemi: true,
  },
);
