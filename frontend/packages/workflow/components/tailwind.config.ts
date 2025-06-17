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
    preflight: false, // 关闭@tailwind base默认样式，避免对现有样式影响
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('@coze-arch/tailwind-config/coze')],
} satisfies Config;
