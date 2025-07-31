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

import { isUndefined } from 'lodash-es';

import { useUnselectAll } from '../public/use-unselect-all';
import { useSelectOnboarding } from '../public/use-select-onboarding';
import { useClearHistory } from '../messages/use-clear-history';
import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import { proxyFreeze } from '../../utils/proxy-freeze';
import { type Message } from '../../store/types';
import { usePreference } from '../../context/preference';

export interface ChatAreaController {
  useUpdateMessages: (
    fixMessageCallback: (message: Message, nowSectionId: string) => Message,
  ) => (message: Message[]) => void;
  clearHistory: () => void;
  selectAll: () => void;
  unselectAll: () => void;
}

export const useChatAreaController = () => {
  const { useMessagesStore, useSelectionStore, useOnboardingStore } =
    useChatAreaStoreSet();

  const { updateReplyIdList, onboardingIdList } = useSelectionStore(state => ({
    updateReplyIdList: state.updateReplyIdList,
    onboardingIdList: state.onboardingIdList,
  }));
  const { enableSelectOnboarding } = usePreference();
  const unselectAll = useUnselectAll();
  const selectOnboarding = useSelectOnboarding();
  const prologue = useOnboardingStore(state => state.prologue);

  const builtinClearHistory = useClearHistory();

  const clearHistory = async () => {
    unselectAll();
    await builtinClearHistory();
  };

  const selectAll = (params?: {
    maxLength: number;
    direction: 'forward' | 'backward';
  }) => {
    const { maxLength, direction } = params ?? {};

    const selectableMessageGroupList = useMessagesStore
      .getState()
      .messageGroupList.filter(messageGroup => messageGroup.selectable);

    const replyIdList = selectableMessageGroupList
      // TODO: You need to confirm that the groupId before the ack is not a replyId.
      .map(messageGroup => messageGroup.groupId)
      .filter((id): id is string => Boolean(id));

    if (isUndefined(maxLength) || !direction) {
      updateReplyIdList(replyIdList);
      return;
    }

    const slicedReplyIdList = (
      direction === 'backward' ? replyIdList : replyIdList.reverse()
    ).slice(0, maxLength);
    updateReplyIdList(slicedReplyIdList);

    const firstOnboardingId = onboardingIdList.at(0);

    if (enableSelectOnboarding) {
      selectOnboarding({
        selectedId: firstOnboardingId ?? null,
        onboarding: {
          prologue,
        },
      });
    }
  };

  const getMessageList = () =>
    proxyFreeze(useMessagesStore.getState().messages);

  return {
    clearHistory,
    selectAll,
    unselectAll,
    getMessageList,
  };
};
