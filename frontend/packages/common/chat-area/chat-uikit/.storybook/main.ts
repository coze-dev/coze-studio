/** @type { import('storybook-react-rspack').StorybookConfig } */

const config = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: 'storybook-react-rspack',
  },
  docs: {
    autodocs: 'tag',
  },
};
export default config;
