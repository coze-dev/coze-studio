import { OnBoarding } from '@coze-common/chat-uikit';
import { type BotEditorOnboardingSuggestion } from '@coze-agent-ide/bot-editor-context-store';

import { useRenderVariable } from '../../hooks/onboarding/use-render-variable-element';
import { OnboardingVariable } from '../../constant/onboarding-variable';

import styles from './index.module.less';

export interface OnboardingPreviewProps {
  content: string;
  suggestions: BotEditorOnboardingSuggestion[];
  getBotInfo: () => {
    avatarUrl: string;
    botName: string;
  };
  getUserName: () => string;
}

export const OnboardingPreview: React.FC<OnboardingPreviewProps> = ({
  content,
  suggestions,
  getBotInfo,
  getUserName,
}) => {
  const username = getUserName();
  const { botName, avatarUrl } = getBotInfo();

  const renderVariable = useRenderVariable({
    [OnboardingVariable.USER_NAME]: username,
  });

  return (
    <OnBoarding
      className={styles.onboarding}
      name={botName}
      avatar={avatarUrl}
      suggestionListWithString={suggestions.map(item => item.content)}
      prologue={content}
      mdBoxProps={{
        insertedElements: renderVariable(content),
      }}
    />
  );
};
