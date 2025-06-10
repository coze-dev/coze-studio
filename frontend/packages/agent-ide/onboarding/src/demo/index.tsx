import React, { useEffect } from 'react';

import { nanoid } from 'nanoid';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';

import { OnboardingMarkdownModal } from '../components/onboarding-markdown-modal';

export const DemoComponent: React.FC<{ visible: boolean }> = ({
  visible = true,
}) => {
  useEffect(() => {
    useBotSkillStore.getState().updateSkillOnboarding({
      prologue: 'test',
      suggested_questions: [
        {
          id: nanoid(),
          content: 'test1',
        },
        {
          id: nanoid(),
          content: 'test22',
        },
        {
          id: nanoid(),
          content: 'test333',
        },
      ],
    });
  }, []);
  return (
    <OnboardingMarkdownModal
      getUserInfo={() => ({
        userId: nanoid(),
        userName: '二二',
      })}
      prologue=""
      onboardingSuggestions={[]}
      onDeleteSuggestion={() => 0}
      onPrologueChange={() => 0}
      onSuggestionChange={() => 0}
      getBotInfo={() => ({
        avatarUrl: '',
        botName: 'I am Bot!!!',
      })}
    />
  );
};
