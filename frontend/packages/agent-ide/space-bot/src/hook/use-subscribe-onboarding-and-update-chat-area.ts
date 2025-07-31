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

import { useEffect } from 'react';

import { shuffle } from 'lodash-es';
import { SuggestedQuestionsShowMode } from '@coze-arch/bot-api/developer_api';
import { type ExtendOnboardingContent } from '@coze-studio/bot-detail-store/src/types/skill';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useChatArea } from '@coze-common/chat-area';
import { getShuffledSuggestions } from '@coze-agent-ide/onboarding';
import { type OnboardingDirtyLogicCompatibilityStore } from '@coze-agent-ide/bot-editor-context-store/src/store/onboarding-dirty-logic-compatibility';
import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';
const maxLength = 3;

interface UseSubscribeOnboardingAndUpdateChatAreaProps {
  setOnboardingSuggestionList?: (
    suggestions: ExtendOnboardingContent['suggested_questions'],
  ) => void;
  updatePrologue?: (prologue: string) => void;
  useOnboardingDirtyLogicCompatibilityStore?: OnboardingDirtyLogicCompatibilityStore;
}

export const useSubscribeOnboardingAndUpdateChatArea = (
  props?: UseSubscribeOnboardingAndUpdateChatAreaProps,
) => {
  const chatArea = useChatArea();
  const { storeSet } = useBotEditor();
  const setOnboardingSuggestionList =
    props?.setOnboardingSuggestionList ?? chatArea.setOnboardingSuggestionList;
  const updatePrologue = props?.updatePrologue ?? chatArea.updatePrologue;
  const useOnboardingDirtyLogicCompatibilityStore =
    props?.useOnboardingDirtyLogicCompatibilityStore ??
    storeSet.useOnboardingDirtyLogicCompatibilityStore;

  const getHasContentSuggestion = (
    suggestion: ExtendOnboardingContent['suggested_questions'][0],
  ) => Boolean(suggestion.content.trim());

  const initRecordingOnboarding = () => {
    const botSkillOnboarding = useBotSkillStore.getState().onboardingContent;

    const hasContentSuggestion = botSkillOnboarding.suggested_questions.filter(
      getHasContentSuggestion,
    );
    updatePrologue(botSkillOnboarding.prologue);

    if (isShowAllSuggestion(botSkillOnboarding)) {
      setOnboardingSuggestionList(hasContentSuggestion);
      return;
    }
    const preVisibleSuggestion =
      hasContentSuggestion.length > maxLength
        ? shuffle(hasContentSuggestion)
        : hasContentSuggestion;

    const visibleSuggestion = preVisibleSuggestion.slice(0, maxLength);
    useOnboardingDirtyLogicCompatibilityStore
      .getState()
      .addShuffledSuggestions(visibleSuggestion);
  };

  useEffect(() => {
    const offDirtyOnboardingSubscribe =
      useOnboardingDirtyLogicCompatibilityStore.subscribe(
        state => state.shuffledSuggestions,
        shuffledSuggestions => {
          setOnboardingSuggestionList(shuffledSuggestions);
        },
      );

    const offBotDetailSubscribe = useBotSkillStore.subscribe(
      state => state.onboardingContent,
      botSkillOnboardingContent => {
        const hasContentSuggestion =
          botSkillOnboardingContent.suggested_questions.filter(
            getHasContentSuggestion,
          );

        updatePrologue(botSkillOnboardingContent.prologue);

        if (isShowAllSuggestion(botSkillOnboardingContent)) {
          setOnboardingSuggestionList(hasContentSuggestion);
          return;
        }

        const { shuffledSuggestions, setShuffledSuggestions } =
          useOnboardingDirtyLogicCompatibilityStore.getState();

        setShuffledSuggestions(
          getShuffledSuggestions({
            originSuggestions: hasContentSuggestion,
            shuffledSuggestions,
            maxLength,
          }),
        );
      },
    );

    initRecordingOnboarding();

    return () => {
      offBotDetailSubscribe();
      offDirtyOnboardingSubscribe();
    };
  }, []);
};

const isShowAllSuggestion = (onboardingContent: ExtendOnboardingContent) =>
  onboardingContent.suggested_questions_show_mode ===
  SuggestedQuestionsShowMode.All;
