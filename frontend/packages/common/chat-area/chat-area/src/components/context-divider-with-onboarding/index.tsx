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
