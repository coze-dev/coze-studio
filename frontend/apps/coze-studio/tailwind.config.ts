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
  // safelist的内容可以允许动态生成tailwind className
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
    preflight: false, // 关闭@tailwind base默认样式，避免对现有样式影响
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('@coze-arch/tailwind-config/coze')],
} satisfies Config;
