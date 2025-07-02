import { ThemeFactory, type COZTheme } from '../../factory';
import { BotNoResultDark } from './BotNoResultDark';
import { BotNoResult } from './BotNoResult';
export function BotSearchNoCard({ theme }: COZTheme) {
  return (
    <ThemeFactory
      theme={theme}
      components={{
        dark: <BotNoResultDark />,
        light: <BotNoResult />,
      }}
    />
  );
}
