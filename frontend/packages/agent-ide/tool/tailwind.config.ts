import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}', '../../packages/**/src/**/*.{ts,tsx}'],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require('@coze-arch/tailwind-config')],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('@coze-arch/tailwind-config/coze')],
} satisfies Config;
