/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  presets: [require('@coze-arch/tailwind-config')],
  important: '',
  content: ['./src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false, // 关闭@tailwind base默认样式，避免对现有样式影响
  },
  plugins: [require('@coze-arch/tailwind-config/coze')],
};
