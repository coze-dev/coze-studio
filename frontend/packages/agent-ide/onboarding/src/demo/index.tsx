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
