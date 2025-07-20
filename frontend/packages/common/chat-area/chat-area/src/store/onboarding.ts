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
import { isUndefined, omitBy, remove } from 'lodash-es';
import { produce } from 'immer';

import { type OnboardingSuggestionItem } from './types';

export type OnboardingStoreStateAction = OnboardingState & OnboardingAction;

interface OnboardingState {
  prologue: string;
  /** 这里仅做存档，以 message store 控制上屏 */
  suggestions: OnboardingSuggestionItem[];
  avatar: string;
  name: string;
}

interface OnboardingAction {
  partialUpdateOnboardingData: (
    prologue?: string,
    suggestions?: OnboardingSuggestionItem[],
  ) => void;
  // todo remove
  /**
   * @deprecated 后面使用标准bot id从senderInfoStore进行索引; onboardingStore记录开场白bot id
   */
  recordBotInfo: (params: { name?: string; avatar?: string }) => void;
  immerUpdateSuggestionById: (id: string, content: string) => void;
  immerDeleteSuggestionById: (id: string) => void;
  immerAddSuggestion: (suggestion: OnboardingSuggestionItem) => void;
  updatePrologue: (prologue: string) => void;
  setSuggestionList: (suggestionList: OnboardingSuggestionItem[]) => void;
  clearOnboardingStore: () => void;
}

export const createOnboardingStore = (mark: string) =>
  create<OnboardingState & OnboardingAction>()(
    devtools(
      subscribeWithSelector(set => ({
        prologue: '',
        suggestions: [],
        avatar: '',
        name: '',
        clearOnboardingStore: () =>
          set({ prologue: '', suggestions: [] }, false, 'clearOnboardingStore'),
        /**
         * 已经不 partial 了 zustand 不会过滤 undefined
         */
        partialUpdateOnboardingData: (prologue, suggestions) =>
          set(
            omitBy({ prologue, suggestions }, isUndefined),
            false,
            'partialUpdateOnboardingData',
          ),
        recordBotInfo: params => {
          const { name, avatar } = params ?? {};
          set({ name, avatar }, false, 'recordBotInfo');
        },
        immerUpdateSuggestionById: (id, content) => {
          set(
            produce<OnboardingState>(state => {
              const targetSuggestionItem = state.suggestions.find(
                suggestion => suggestion.id === id,
              );
              if (targetSuggestionItem) {
                targetSuggestionItem.content = content;
              }
            }),
            false,
            'immerUpdateSuggestionById',
          );
        },
        immerDeleteSuggestionById: id => {
          set(
            produce<OnboardingState>(state => {
              remove(state.suggestions, item => item.id === id);
            }),
            false,
            'deleteSuggestionById',
          );
        },
        immerAddSuggestion: suggestion => {
          set(
            produce<OnboardingState>(state => {
              state.suggestions.push(suggestion);
            }),
            false,
            'addSuggestion',
          );
        },
        updatePrologue: prologue => {
          set({ prologue }, false, 'updatePrologue');
        },
        setSuggestionList: list => {
          set({ suggestions: list }, false, 'setSuggestionList');
        },
      })),
      {
        name: `botStudio.ChatAreaOnboarding.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

export type OnboardingStore = ReturnType<typeof createOnboardingStore>;
