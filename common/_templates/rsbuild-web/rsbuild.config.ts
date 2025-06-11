import tailwindcss from 'tailwindcss';
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './index.html',
  },
  tools: {
    postcss(config) {
      config.postcssOptions?.plugins?.push(tailwindcss);
    },
  },
});
