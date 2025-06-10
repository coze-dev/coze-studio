import path from 'path';
import remarkGfm from 'remark-gfm';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { StorybookConfig } from '@storybook/react-webpack5';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import SemiWebpackPlugin from '@douyinfe/semi-webpack-plugin';
import styling from './styling';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  staticDirs: ['../public'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-dark-mode',
    styling,
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  typescript: {
    check: true,
    checkOptions: {
      typescript: {
        configFile: path.resolve(__dirname, '../tsconfig.story.json'),
        mode: 'write-references',
        build: true,
      },
    },
  },

  docs: {
    autodocs: 'tag', //process.env.NODE_ENV === 'production'
  },

  webpackFinal: async config => {
    // @ts-expect-error -- linter-disable-autofix
    config.resolve.extensions.push('.ts', '.tsx');
    const semiPlugins: any[] = [
      new MiniCssExtractPlugin({
        insert: function (linkTag) {
          const reference = document.querySelector('#storybook-docs');
          if (reference) {
            // @ts-expect-error -- linter-disable-autofix
            reference.parentNode.insertBefore(linkTag, reference);
          }
        },
      }),
      new SemiWebpackPlugin({
        theme: '@coze-arch/semi-theme-hand01',
        include: '@coze-arch/semi-theme-hand01/scss/local.scss',
        extractCssOptions: {
          loader: MiniCssExtractPlugin.loader,
        },
        overrideStylesheetLoaders: loaders => {
          return [...loaders];
        },
      }),
    ];
    const resolvePlugins: any = [
      new TsconfigPathsPlugin({
        // @ts-expect-error -- linter-disable-autofix
        extensions: config.resolve.extensions,
        configFile: path.resolve(__dirname, '../tsconfig.story.json'),
      }),
    ];

    // @ts-expect-error -- linter-disable-autofix
    config.resolve.plugins = [
      // @ts-expect-error -- linter-disable-autofix
      ...(config.resolve.plugins || []),
      ...resolvePlugins,
    ];

    // 方便本地调试样式, 后续会走标准包发布；
    // @ts-expect-error -- linter-disable-autofix
    config.resolve.alias = {
      // @ts-expect-error -- linter-disable-autofix
      ...config.resolve.alias,
      '@ies/semi-theme-coze': path.resolve(__dirname, '../src/styles/semi'),
      '@coze-arch/semi-theme-hand01': path.dirname(
        require.resolve('@coze-arch/semi-theme-hand01/package.json'),
      ),
    };

    config.plugins = [
      // @ts-expect-error -- linter-disable-autofix
      ...config.plugins,
      ...semiPlugins,
    ];

    // Add SVGR Loader
    // ========================================================
    // Remove svg rules from existing webpack rule
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // This modifies the existing image rule to exclude .svg files
    // since you want to handle those files with @svgr/webpack
    // const imageRule = config.module.rules.find(rule =>
    //   rule?.['test']?.test('.svg'),
    // );
    // if (imageRule) {
    //   imageRule['exclude'] = /\.svg$/;
    // }
    // // Configure .svg files to be loaded with @svgr/webpack
    // config.module.rules.push({
    //   test: /\.svg$/,
    //   use: [
    //     {
    //       loader: '@svgr/webpack',
    //       options: {
    //         icon: true,
    //         svgoConfig: {
    //           plugins: [
    //             {
    //               name: 'removeViewBox',
    //               active: false,
    //             },
    //           ],
    //         },
    //       },
    //     },
    //   ],
    //   type: 'javascript/auto',
    // });

    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: path.resolve(__dirname, '../tsconfig.story.json'),
          },
        },
      ],
    });

    // Add css Loader
    // ========================================================
    // Remove css rules from existing webpack rule
    // replaced  by styling.ts config
    /* config.module.rules = rules.filter((rule) => !(rule?.test instanceof RegExp && rule.test.test?.('.css')));
    config.module.rules.push({
      test: /\.css$/,
      use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }]
    }); */
    return config;
  },
};
export default config;
