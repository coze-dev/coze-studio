import { mergeConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

import { defaultVitestConfig } from './preset-default';

export const webPreset = mergeConfig(defaultVitestConfig, {
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    framework: {
      hmr: 'page',
    },
  },
});
