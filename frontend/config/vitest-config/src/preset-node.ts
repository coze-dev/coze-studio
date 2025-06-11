import { mergeConfig } from 'vitest/config';

import { defaultVitestConfig } from './preset-default';

export const nodePreset = mergeConfig(defaultVitestConfig, {});
