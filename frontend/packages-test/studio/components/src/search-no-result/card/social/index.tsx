import { ThemeFactory, type COZTheme } from '../../factory';
import { SocialNoResultDark } from './SocialNoResultDark';
import { SocialNoResult } from './SocialNoResult';
export function SocialSearchNoCard({ theme }: COZTheme) {
  return (
    <ThemeFactory
      theme={theme}
      components={{
        dark: <SocialNoResultDark />,
        light: <SocialNoResult />,
      }}
    />
  );
}
