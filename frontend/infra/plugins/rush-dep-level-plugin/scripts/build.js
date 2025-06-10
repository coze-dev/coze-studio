const path = require('path');

const esbuild = require('esbuild');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const distPath = path.resolve(__dirname, '../lib');
const { log, error } = console;

esbuild
  .build({
    minify: isProd,
    sourcemap: isDev ? 'linked' : 'external',
    entryPoints: [path.resolve(__dirname, '../src/index.ts')],
    bundle: true,
    platform: 'node',
    target: ['node12.22.0'],
    outdir: distPath,
    tsconfig: path.resolve(__dirname, '../tsconfig.build.json'),
    define: {
      __PRODUCTION__: isProd,
    },
    logLevel: isProd ? 'error' : 'info',
    banner: {
      js: '// nolint: cyclo_complexity, method_line',
    },
    plugins: [],
    watch: isDev
      ? {
          onRebuild(err) {
            if (err) {
              error(err);
            } else {
              log('Watch build succeeded', new Date());
            }
          },
        }
      : false,
  })
  .then(() => {
    if (isDev) {
      log('Watching...');
    }
  })
  .catch(e => {
    error(e);
    if (isProd) {
      process.exit(1);
    }
  });
