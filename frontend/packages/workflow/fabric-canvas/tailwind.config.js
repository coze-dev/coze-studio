/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  presets: [require('@coze-arch/tailwind-config')],
  important: '',
  content: ['./src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false, // Turn off @tailwind base default styles to avoid affecting existing styles
  },
  plugins: [require('@coze-arch/tailwind-config/coze')],
};
