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

export default {
  darkMode: 'class',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require('@coze-arch/tailwind-config')],
  content: [
    './src/**/*.{html,tsx}',
    './node_modules/@coze-arch/coze-design/dist/**/*.{js,jsx,css}',
  ],
  corePlugins: {
    preflight: false, // Turn off @tailwind base default styles to avoid affecting existing styles
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('@coze-arch/tailwind-config/coze')],
} satisfies Config;
