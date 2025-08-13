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

/** @type {import('tailwindcss').Config} */
const { genTailwindPlugin } = require('@coze-arch/tailwind-config/util');
module.exports = {
  darkMode: 'class',
  presets: [require('@coze-arch/tailwind-config')],
  important: '.coze-chat-sdk',
  content: [
    './src/**/*.{html,tsx}',
    '../../../../../packages/components/coze-design/src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@coze-arch/coze-design/dist/**/*.{js,jsx,css}',
    '../open-chat/src/**/*.{js,ts,jsx,tsx}',
    '../../../common/chat-area/chat-area/src/**/*.{js,ts,jsx,tsx}',
    '../../../common/chat-area/chat-uikit/src/**/*.{js,ts,jsx,tsx}',
    '../../../common/chat-area/plugin-chat-shortcuts/src/**/*.{js,ts,jsx,tsx}',
  ],
  corePlugins: {
    preflight: false, // 关闭@tailwind base默认样式，避免对现有样式影响：https://code.byted.org/obric/bot-studio-monorepo/merge_requests/2945
  },
  plugins: [genTailwindPlugin(':root', '.dark .coze-chat-sdk-dark')],
};
