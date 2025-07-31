/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
