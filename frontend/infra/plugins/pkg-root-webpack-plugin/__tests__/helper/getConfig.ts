import path from 'path';

import type { Configuration } from 'webpack';

import PkgRootWebpackPlugin from '../../src';

const rootPlugin = new PkgRootWebpackPlugin({
  excludeFolders: ['infra/plugins/pkg-root-webpack-plugin'],
});
rootPlugin.rootFolders = ['cross-pkgs/bar', 'fixtures/basic'];

const getWebpackConfig = (target: string): Partial<Configuration> => {
  const context = path.resolve(__dirname, '../fixtures');
  const relativePath = path.dirname(target);
  const outputDir = path.resolve(__dirname, '../outputs', relativePath);

  const config = {
    // 使用 none 避免引入 NamedModulesPlugin 显示模块的相对路径导致快照对比失效
    mode: 'none',
    devtool: false,
    context,
    entry: {
      app: path.resolve(context, target),
    },
    output: {
      path: outputDir,
      filename: '[name].js',
    },
    resolve: {
      modules: [
        path.join(__dirname, '../../node_modules'),
        path.join(relativePath, 'node_modules'),
      ],
    },
    plugins: [rootPlugin],
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
        },
      ],
    },
  } as Configuration;
  return config;
};

export default getWebpackConfig;
