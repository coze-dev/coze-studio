import { mergeConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import path from 'path';

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../src', '../stories'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@edenx/storybook',
    options: {
      bundler: 'webpack',
      configPath: path.resolve(__dirname, '../edenx.config.ts'),
    },
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: config =>
    mergeConfig(config, {
      plugins: [
        svgr({
          svgrOptions: {
            native: false,
          },
        }),
      ],
    }),
};
export default config;
