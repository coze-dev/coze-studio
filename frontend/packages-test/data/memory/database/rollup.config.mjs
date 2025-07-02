import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'fs';

import tailwindcss from 'tailwindcss';
import ts from 'rollup-plugin-ts';
import postcss from 'rollup-plugin-postcss';
import { nodeExternals } from 'rollup-plugin-node-externals';
import cleanup from 'rollup-plugin-cleanup';
import autoprefixer from 'autoprefixer';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// CI 环境下不需要构建这么多版本
const isInCIEnv = process.env.CI === 'true';

const banner =
  '/*!\n' +
  ` * ${packageJson.name} v${packageJson.version}\n` +
  ` * (c) 2023-${new Date().getFullYear()} Flow team\n` +
  ' */';

const outputConfigs = {
  esm: {
    banner,
    format: 'es',
    file: path.resolve(__dirname, 'dist/esm/index.js'),
  },
  umd: {
    banner,
    format: 'umd',
    file: path.resolve(__dirname, 'dist/umd/index.js'),
  },
};

const createReplacePlugin = () =>
  replace({
    preventAssignment: true,
    values: {
      __TEST__: false,
      __VERSION__: `'${packageJson.version}'`,
      __DEV__: process.env.NODE_ENV === 'development',
    },
  });

const createConfig = (format, output) => {
  const isUmdBuild = /^umd/.test(format);
  const isEsmBuild = /^esm/.test(format);

  const input = path.resolve(__dirname, './src/index.ts');

  // TODO: 这里替换成真实的名称
  if (isUmdBuild) {
    output.name = 'FlowFoo';
  }

  return {
    input,
    output,
    plugins: [
      commonjs(),
      createReplacePlugin(),
      nodeResolve(),
      cleanup(),
      postcss({
        plugins: [tailwindcss(), autoprefixer()],
        autoModules: true,
        modules: {
          generateScopedName: '[name][local]_[hash:base64:5]',
        },
        extensions: ['.css', '.less'],
      }),
      json({
        namedExports: false,
      }),
      // ESM 仅打包必要内容
      // UMD 由于需要放到 page 上直接运行，因此需要将所有依赖都打包进来
      isEsmBuild
        ? nodeExternals({ devDeps: true, peerDeps: true, deps: true })
        : null,
      ts({
        transpiler: 'swc',
        tsconfig: path.resolve(__dirname, './tsconfig.build.json'),
      }),
    ].filter(Boolean),
  };
};

export default Object.keys(outputConfigs)
  .filter(k => (isInCIEnv ? k === 'esm' : true))
  .map(format => createConfig(format, outputConfigs[format]));
