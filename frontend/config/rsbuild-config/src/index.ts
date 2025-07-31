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

import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginLess } from '@rsbuild/plugin-less';
import { type RsbuildConfig, mergeRsbuildConfig } from '@rsbuild/core';
import { PkgRootWebpackPlugin } from '@coze-arch/pkg-root-webpack-plugin';
import { GLOBAL_ENVS } from '@coze-arch/bot-env';
import { SemiRspackPlugin } from '@douyinfe/semi-rspack-plugin';

const getDefine = () => {
  const define = {};
  Object.keys(GLOBAL_ENVS).forEach(key => {
    // In the definition of rspack, strings need to be enclosed in double quotes before they can be used as strings in code.
    if (typeof GLOBAL_ENVS[key] === 'string') {
      define[key] = `"${GLOBAL_ENVS[key]}"`;
    } else {
      define[key] = GLOBAL_ENVS[key];
    }
  });
  return define;
};

export const overrideBrowserslist = [
  'chrome >= 51',
  'edge >= 15',
  'firefox >= 54',
  'safari >= 10',
  'ios_saf >= 10',
];

const generateCdnPrefix = () => {
  if (process.env.CDN_INNER_CN) {
    return `https://${process.env.CDN_INNER_CN}/${
      process.env.CDN_PATH_PREFIX ? `${process.env.CDN_PATH_PREFIX}/` : ''
    }`;
  }
  return '/';
};

export const defineConfig = (options: Partial<RsbuildConfig>) => {
  const cdnPrefix = generateCdnPrefix();
  const port = 8080;
  const commonAssertsUrl = path.dirname(
    require.resolve('@coze-common/assets/package.json'),
  );

  const config: RsbuildConfig = {
    dev: {
      client: {
        port,
        host: '127.0.0.1',
        protocol: 'ws',
      },
    },
    server: {
      port,
    },
    plugins: [
      pluginReact(),
      pluginSvgr({
        mixedImport: true,
        svgrOptions: {
          exportType: 'named',
        },
      }),
      pluginLess({
        lessLoaderOptions: {
          additionalData: `@import "${path.resolve(
            commonAssertsUrl,
            'style/variables.less',
          )}";`,
        },
      }),
      pluginSass({
        sassLoaderOptions: {
          sassOptions: {
            silenceDeprecations: ['mixed-decls', 'import', 'function-units'],
          },
        },
      }),
    ],
    output: {
      filenameHash: true,
      assetPrefix: cdnPrefix,
      injectStyles: true,
      cssModules: {
        auto: true,
      },
      sourceMap: {
        js: 'source-map',
      },
      overrideBrowserslist,
    },
    source: {
      define: getDefine(),
      alias: {
        '@coze-arch/semi-theme-hand01': path.dirname(
          require.resolve('@coze-arch/semi-theme-hand01/package.json'),
        ),
      },
      include: [
        // The following packages contain undegraded ES 2022 syntax (private methods) that need to be packaged
        /\/node_modules\/(marked|@dagrejs|@tanstack)\//,
      ],
    },
    tools: {
      postcss: (opts, { addPlugins }) => {
        addPlugins([
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('tailwindcss/nesting')(require('postcss-nesting')),
        ]);
      },
      rspack: (_, { appendPlugins }) => {
        appendPlugins([
          new PkgRootWebpackPlugin(),
          new SemiRspackPlugin({
            theme: '@coze-arch/semi-theme-hand01',
          }),
        ]);
      },
    },
  };

  return mergeRsbuildConfig(config, options);
};
