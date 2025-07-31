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

import type { Config } from 'tailwindcss';
import {
  designTokenToTailwindConfig,
  getTailwindContents,
} from '@coze-arch/tailwind-config/design-token';
import json from '@coze-arch/semi-theme-hand01/raw.json';
import { SCREENS_TOKENS } from '@coze-arch/responsive-kit/constant';

const contents = getTailwindContents('@coze-studio/app');
console.log(`Got ${contents.length} contents for tailwind`);

export default {
  content: contents,
  // Safelist content can allow dynamic tailwind className
  safelist: [
    {
      pattern: /(gap-|grid-).+/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
  ],
  important: '',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require('@coze-arch/tailwind-config')],
  theme: {
    screens: {
      mobile: { max: '1200px' },
    },
    extend: {
      screens: SCREENS_TOKENS,
      ...designTokenToTailwindConfig(json),
    },
  },
  corePlugins: {
    preflight: false, // Turn off @tailwind base default styles to avoid affecting existing styles
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('@coze-arch/tailwind-config/coze')],
} satisfies Config;
