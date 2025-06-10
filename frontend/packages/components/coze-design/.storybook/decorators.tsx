import type { Preview } from "@storybook/react";
import { ThemeProvider } from '@/components/theme';
import { useDarkMode } from "storybook-dark-mode";
import Toggle from './toggle';

const decorators: Preview["decorators"] = [
  (Story) => {
    return (
      <ThemeProvider defaultTheme={useDarkMode() ? 'dark' : 'light'} changeSemiTheme={true}>
        <Toggle />
        <Story />
      </ThemeProvider>
    );
  },
];

export default decorators;
