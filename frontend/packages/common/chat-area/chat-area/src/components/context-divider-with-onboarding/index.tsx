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

import { useState, type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { Wrapper } from '../wrapper';
import { Suggestions } from '../suggestion';
import { OnboardingMessage } from '../onborading-message';
import { ContextDivider } from '../context-divider';
import { getNewConversationDomId } from '../../utils/get-new-conversation-dom-id';
import { useMessagesOverview } from '../../hooks/public/use-messages-overview';
import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';
import { usePreference } from '../../context/preference';
import { useCopywriting } from '../../context/copywriting';

import styles from './index.module.less';

interface IProps {
  isLatest: boolean;
  showOnboarding: boolean;
}

export const ContextDividerWithOnboarding: FC<IProps> = ({
  isLatest,
  showOnboarding,
}) => {
  const [onboardingId, setOnboardingId] = useState<string | null>(null);

  const { clearContextDividerText } = useCopywriting();
  const { useOnboardingStore } = useChatAreaStoreSet();

  const { suggestions } = useOnboardingStore(
    useShallow(state => ({
      suggestions: state.suggestions,
    })),
  );

  const { latestSectionHasMessage } = useMessagesOverview();

  const { messageWidth, onboardingSuggestionsShowMode } = usePreference();

  const onOnboardingIdChange = (id: string) => {
    setOnboardingId(id);
  };

  return (
    <div
      className={styles['new-conversation']}
      id={getNewConversationDomId(onboardingId)}
    >
      <Wrapper>
        <ContextDivider text={clearContextDividerText} />
      </Wrapper>
      {showOnboarding ? (
        <div>
          <Wrapper>
            <div style={{ width: messageWidth }}>
              <OnboardingMessage onOnboardingIdChange={onOnboardingIdChange} />
              {!latestSectionHasMessage && isLatest ? (
                <Suggestions
                  suggestions={suggestions.map(sug => sug.content)}
                  isInNewConversation={true}
                  senderId={undefined}
                  suggestionsShowMode={onboardingSuggestionsShowMode}
                />
              ) : null}
            </div>
          </Wrapper>
        </div>
      ) : null}
    </div>
  );
};
