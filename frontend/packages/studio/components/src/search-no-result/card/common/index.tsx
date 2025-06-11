import { ThemeFactory, type COZTheme } from '../../factory';
import { CommonNoResultDark } from './CommonNoResultDark';
import { CommonNoResult } from './CommonNoResult';
export function CommonSearchNoCard({ theme }: COZTheme) {
  return (
    <ThemeFactory
      theme={theme}
      components={{
        dark: <CommonNoResultDark />,
        light: <CommonNoResult />,
      }}
    />
  );
}
