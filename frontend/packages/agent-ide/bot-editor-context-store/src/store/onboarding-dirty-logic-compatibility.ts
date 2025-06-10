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
 * 用来处理 bot 编辑页 onboarding 的复杂、脏业务逻辑
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
