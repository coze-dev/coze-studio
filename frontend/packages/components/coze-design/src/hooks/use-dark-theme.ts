import { useDarkMode } from 'storybook-dark-mode';

export function useDarkTheme() {
  const storyBookTheme = useDarkMode();
  return storyBookTheme ? 'dark' : 'light';
}
