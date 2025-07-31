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

// FIXME: Unable to resolve path to module 'vitest/config'

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    mockReset: false,
    coverage: {
      provider: 'v8',
      reporter: ['cobertura', 'text', 'html', 'clover', 'json'],
      exclude: ['src/const', '.eslintrc.js', 'src/index.ts'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    },
  },
});
