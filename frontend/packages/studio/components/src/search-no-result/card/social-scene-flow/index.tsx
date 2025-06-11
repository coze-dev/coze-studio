import { ThemeFactory, type COZTheme } from '../../factory';
import { SocialSceneFlowNoResultDark } from './SocialSceneFlowNoResultDark';
import { SocialSceneFlowNoResult } from './SocialSceneFlowNoResult';
export function SocialSceneFlowSearchNoCard({ theme }: COZTheme) {
  return (
    <ThemeFactory
      theme={theme}
      components={{
        dark: <SocialSceneFlowNoResultDark />,
        light: <SocialSceneFlowNoResult />,
      }}
    />
  );
}
