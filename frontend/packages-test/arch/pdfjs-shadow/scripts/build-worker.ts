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
