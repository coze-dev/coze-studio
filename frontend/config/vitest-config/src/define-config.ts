import { resolve } from 'path';

import { mergeConfig, type UserConfig } from 'vitest/config';

import { webPreset } from './preset-web';
import { nodePreset } from './preset-node';
import { defaultVitestConfig } from './preset-default';

export interface VitestConfig extends UserConfig {
  /**
   * A string representing the project root directory.
   */
  dirname: string;
  /**
   * A string representing the preset configuration style, which can be one of 'default', 'node', or 'web'.
   */
  preset: 'default' | 'node' | 'web';
}

const calBasePreset = (preset: string) => {
  switch (preset) {
    case 'node':
      return nodePreset;
    case 'web':
      return webPreset;
    default:
      return defaultVitestConfig;
  }
};

export interface OtherConfig {
  /**
   * 用于修复semi的package.json导出的配置问题
   */
  fixSemi: boolean;
}

export const defineConfig = (
  config: VitestConfig,
  otherConfig?: OtherConfig,
): UserConfig => {
  const { dirname, preset, ...userVitestConfig } = config;
  if (typeof dirname !== 'string') {
    throw new Error('define VitestConfig need a dirname.');
  }
  const baseConfig = calBasePreset(preset);

  if (otherConfig?.fixSemi) {
    const alias = [
      {
        find: /^@douyinfe\/semi-ui$/,
        replacement: '@douyinfe/semi-ui/lib/es',
      },
      {
        find: /^@douyinfe\/semi-foundation$/,
        replacement: '@douyinfe/semi-foundation/lib/es',
      },
      {
        find: 'lottie-web',
        replacement: resolve(__dirname, './tsc-only.ts'),
      },
    ];

    if (Array.isArray(userVitestConfig.test?.alias)) {
      alias.push(...userVitestConfig.test.alias);
    } else if (typeof userVitestConfig.test?.alias === 'object') {
      alias.push(
        ...Object.entries(userVitestConfig.test.alias).map(([key, value]) => ({
          find: key,
          replacement: value,
        })),
      );
    }

    userVitestConfig.test = {
      ...userVitestConfig.test,
      alias,
    };
  }

  return mergeConfig(baseConfig, userVitestConfig);
};
