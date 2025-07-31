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

/**
 * A suggestion to store all messages (type: follow_up)
 */
import { createWithEqualityFn } from 'zustand/traditional';
import { devtools } from 'zustand/middleware';
import { produce } from 'immer';

export interface SuggestionBatch {
  isError?: boolean;
  suggestions: string[];
}
interface SuggestionsState {
  suggestionBatchMap: Record<string, SuggestionBatch>;
}

export interface IdAndSuggestion {
  replyId: string;
  suggestion: string;
}

interface SuggestionsAction {
  updateSuggestion: (replyId: string, suggestion: string) => void;
  updateSuggestionsBatch: (batch: IdAndSuggestion[]) => void;
  setGenerateSuggestionError: (replyId: string) => void;
  clearSuggestions: () => void;
  getSuggestions: (replyId?: string) => SuggestionBatch | undefined;
}

export const createSuggestionsStore = (mark: string) =>
  createWithEqualityFn<SuggestionsState & SuggestionsAction>()(
    devtools(
      (set, get) => ({
        suggestionBatchMap: {},
        setGenerateSuggestionError: replyId => {
          set(
            produce<SuggestionsState>(state => {
              const target = state.suggestionBatchMap[replyId];
              if (!target) {
                state.suggestionBatchMap[replyId] = {
                  isError: true,
                  suggestions: [],
                };
                return;
              }
              target.isError = true;
            }),
            false,
            'setGenerateSuggestionError',
          );
        },
        updateSuggestion: (replyId, suggestion) => {
          set(
            produce<SuggestionsState>(state => {
              updateSuggestionMutator(replyId, suggestion, state);
            }),
            false,
            'updateSuggestion',
          );
        },
        updateSuggestionsBatch: batch => {
          set(
            produce<SuggestionsState>(state => {
              for (const item of batch) {
                const { replyId, suggestion } = item;
                updateSuggestionMutator(replyId, suggestion, state);
              }
            }),
            false,
            'updateSuggestionBatch',
          );
        },
        getSuggestions: replyId => {
          if (!replyId) {
            return;
          }
          const sugs = get().suggestionBatchMap[replyId];
          return sugs;
        },
        clearSuggestions: () => {
          set({ suggestionBatchMap: {} }, false, 'clearSuggestions');
        },
      }),
      {
        name: `botStudio.ChatAreaSuggestions.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

const updateSuggestionMutator = (
  replyId: string,
  suggestion: string,
  state: SuggestionsState,
) => {
  const { suggestionBatchMap } = state;
  const batchItem = suggestionBatchMap[replyId] ?? { suggestions: [] };
  suggestionBatchMap[replyId] = batchItem;
  if (batchItem.suggestions.includes(suggestion)) {
    return;
  }
  batchItem.suggestions.push(suggestion);
};

export type SuggestionsStore = ReturnType<typeof createSuggestionsStore>;
