import { ThemeFactory, type COZTheme } from '../../factory';
import { RecommendNoResultDark } from './RecommendNoResultDark';
import { RecommendNoResult } from './RecommendNoResult';
export function RecommendSearchNoCard({ theme }: COZTheme) {
  return (
    <ThemeFactory
      theme={theme}
      components={{
        dark: <RecommendNoResultDark />,
        light: <RecommendNoResult />,
      }}
    />
  );
}
