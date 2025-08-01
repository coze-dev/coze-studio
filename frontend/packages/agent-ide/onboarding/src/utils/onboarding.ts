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

import { intersectionBy, xorBy } from 'lodash-es';
import { produce } from 'immer';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { type BotEditorOnboardingSuggestion } from '@coze-agent-ide/bot-editor-context-store';

import { recordExhaustiveCheck } from './exhaustive-check';

export const getImmerUpdateOnboardingSuggestion = (
  suggestionList: BotEditorOnboardingSuggestion[],
  { id, content, highlight }: Partial<BotEditorOnboardingSuggestion>,
) =>
  produce(suggestionList, draft => {
    const target = draft.find(suggestion => suggestion.id === id);
    if (!target) {
      return;
    }
    if (typeof content !== 'undefined') {
      target.content = content;
    }
    target.highlight = highlight;
    return draft;
  });

export const getOnboardingSuggestionAfterDeleteById = (
  suggestionList: BotEditorOnboardingSuggestion[],
  id: string,
) => suggestionList.filter(suggestion => suggestion.id !== id);

export const immerUpdateOnboardingStoreSuggestion = (
  id: string,
  value: Partial<BotEditorOnboardingSuggestion>,
) => {
  const { updateSkillOnboarding, onboardingContent } =
    useBotSkillStore.getState();

  updateSkillOnboarding({
    suggested_questions: getImmerUpdateOnboardingSuggestion(
      onboardingContent.suggested_questions,
      value,
    ),
  });
};

export const updateOnboardingStorePrologue = (content: string) => {
  useBotSkillStore.getState().updateSkillOnboarding({ prologue: content });
};

export const deleteOnboardingStoreSuggestion = (id: string) => {
  useBotSkillStore.getState().updateSkillOnboarding(prev => ({
    suggested_questions: getOnboardingSuggestionAfterDeleteById(
      prev.suggested_questions,
      id,
    ),
  }));
};

export const getShuffledSuggestions = ({
  originSuggestions,
  shuffledSuggestions,
  maxLength,
}: {
  originSuggestions: BotEditorOnboardingSuggestion[];
  shuffledSuggestions: BotEditorOnboardingSuggestion[];
  maxLength: number;
}) => {
  const intersectionSuggestion = intersectionBy(
    originSuggestions,
    shuffledSuggestions,
    suggestion => suggestion.id,
  );
  const preVisibleSuggestion = xorBy(
    originSuggestions,
    intersectionSuggestion,
    suggestion => suggestion.id,
  );

  // There are more than intersections in the chatArea data that need to be deleted.
  const toDeleteSuggestion = xorBy(
    shuffledSuggestions,
    intersectionSuggestion,
    suggestion => suggestion.id,
  );

  // There is more than intersection in the data of the bot debugging page, which needs to be added.
  const toAddSuggestion = preVisibleSuggestion.slice(
    0,
    maxLength - intersectionSuggestion.length,
  );

  const toUpdateMessage = shuffledSuggestions
    .filter(
      ({ id }) =>
        !toDeleteSuggestion.find(toDeleteItem => toDeleteItem.id === id),
    )
    .concat(toAddSuggestion);

  return produce(toUpdateMessage, draft => {
    intersectionSuggestion.forEach(({ id, content, highlight, ...rest }) => {
      recordExhaustiveCheck(rest);
      const target = draft.find(item => item.id === id);
      if (!target) {
        return;
      }
      target.content = content;
      target.highlight = highlight;
    });
  });
};
