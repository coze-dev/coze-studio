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

import { isValidContext } from '../../utils/is-valid-context';
import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from './use-chat-area-context';

export const useChatArea = () => {
  const chatAreaContext = useChatAreaContext();
  const { useOnboardingStore, useSectionIdStore } = useChatAreaStoreSet();

  if (!isValidContext(chatAreaContext)) {
    throw new Error('chatAreaContext is not valid');
  }

  const { refreshMessageList, reporter } = chatAreaContext;

  const {
    partialUpdateOnboardingData,
    updatePrologue,
    immerUpdateSuggestionById,
    immerAddSuggestion,
    immerDeleteSuggestionById,
    setSuggestionList,
    recordBotInfo,
  } = useOnboardingStore.getState();

  const getOnboardingContent = () => {
    const { prologue, suggestions } = useOnboardingStore.getState();
    return { prologue, suggestions };
  };

  return {
    partialUpdateOnboardingData,
    updatePrologue,
    immerAddSuggestion,
    immerUpdateSuggestionById,
    immerDeleteSuggestionById,
    getOnboardingContent,
    refreshMessageList,
    setOnboardingSuggestionList: setSuggestionList,
    reporter,
    recordBotInfo,
    getLatestSectionId: () => useSectionIdStore.getState().latestSectionId,
  };
};
