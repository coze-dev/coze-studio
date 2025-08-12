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

// eslint-disable-next-line @coze-arch/no-batch-import-or-export
import * as esbuild from 'esbuild';

import { OUTPUT_DIR } from './const';
export const buildWorker = async () => {
  const input =
    'import "core-js/proposals/promise-with-resolvers"; import "pdfjs-dist/build/pdf.worker.min.mjs"';

  await esbuild.build({
    sourcemap: false,
    stdin: {
      contents: input,
      loader: 'ts',
      resolveDir: '.',
    },
    bundle: true,
    platform: 'node',
    target: ['chrome85'],
    outfile: path.resolve(OUTPUT_DIR, 'worker.js'),
    logLevel: 'error',
    minify: true,
  });
};
