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

import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';

import { recordExhaustiveCheck } from '../utils/exhaustive-check';
import { type BotEditorOnboardingSuggestion } from './type';

export interface OnboardingDirtyLogicCompatibilityState {
  shuffledSuggestions: BotEditorOnboardingSuggestion[];
}

export interface OnboardingDirtyLogicCompatibilityAction {
  setShuffledSuggestions: (
    suggestions: BotEditorOnboardingSuggestion[],
  ) => void;
  addShuffledSuggestions: (
    suggestions: BotEditorOnboardingSuggestion[],
  ) => void;
  deleteShuffledSuggestionByIdList: (idList: string[]) => void;
  updateShuffledSuggestion: (suggestion: BotEditorOnboardingSuggestion) => void;
}

/**
 * Complex, dirty business logic for handling bot edit page onboarding
 */
export const createOnboardingDirtyLogicCompatibilityStore = () =>
  create<
    OnboardingDirtyLogicCompatibilityState &
      OnboardingDirtyLogicCompatibilityAction
  >()(
    devtools(
      subscribeWithSelector((set, get) => ({
        shuffledSuggestions: [],
        setShuffledSuggestions: suggestions => {
          set(
            {
              shuffledSuggestions: suggestions,
            },
            false,
            'setShuffledSuggestions',
          );
        },
        addShuffledSuggestions: suggestions => {
          set(
            {
              shuffledSuggestions:
                get().shuffledSuggestions.concat(suggestions),
            },
            false,
            'addShuffledSuggestions',
          );
        },
        deleteShuffledSuggestionByIdList: idList => {
          set(
            {
              shuffledSuggestions: get().shuffledSuggestions.filter(
                suggestion => !idList.find(id => id === suggestion.id),
              ),
            },
            false,
            'deleteShuffledSuggestionByIdList',
          );
        },
        updateShuffledSuggestion: ({ id, content, highlight, ...rest }) => {
          set(
            produce<OnboardingDirtyLogicCompatibilityState>(state => {
              recordExhaustiveCheck(rest);
              const target = state.shuffledSuggestions.find(
                item => item.id === id,
              );
              if (!target) {
                return;
              }
              target.content = content;
              target.highlight = highlight;
            }),
            false,
            'updateShuffledSuggestion',
          );
        },
      })),
      {
        name: 'botStudio.botEditor.onboardingDirtyLogicCompatibility',
        enabled: IS_DEV_MODE,
      },
    ),
  );

export type OnboardingDirtyLogicCompatibilityStore = ReturnType<
  typeof createOnboardingDirtyLogicCompatibilityStore
>;
