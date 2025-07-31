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
   * Used to fix the configuration issue of semi's package.json export
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
