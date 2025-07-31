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

import { flatMessageGroupIdList } from '../utils/message-group/flat-message-group-list';
import { type SystemLifeCycleService } from '../plugin/life-cycle';
import { type ChatAreaEventCallback } from '../context/chat-area-context/chat-area-callback';
import { type MessagesStore } from './messages';

export type SelectionStoreStateAction = SelectionState & SelectionAction;

interface SelectionState {
  selectedReplyIdList: string[];
  selectedOnboardingId: string | null;
  /**
   * Considering that currently only the option depends on onboardingId, it is put in.
   */
  onboardingIdList: string[];
}

interface SelectionAction {
  addReplyId: (replyId: string) => void;
  removeReplyId: (replyId: string) => void;
  clearSelectedReplyIdList: () => void;
  updateReplyIdList: (replyIdList: string[]) => void;
  setOnboardingSelected: (id: string | null) => void;
  addOnboardingId: (id: string) => void;
  removeOnboardingId: (id: string) => void;
}

export const createSelectionStore = (mark: string) => {
  const useSelectionStore = create<SelectionState & SelectionAction>()(
    devtools(
      subscribeWithSelector(set => ({
        selectedReplyIdList: [],
        selectedOnboardingId: null,
        onboardingIdList: [],
        addReplyId: replyId => {
          set(
            produce<SelectionState>(state => {
              state.selectedReplyIdList.push(replyId);
            }),
            false,
            'addReplyId',
          );
        },
        removeReplyId: replyId => {
          set(
            produce<SelectionState>(state => {
              state.selectedReplyIdList = state.selectedReplyIdList.filter(
                id => id !== replyId,
              );
            }),
            false,
            'removeReplyId',
          );
        },
        updateReplyIdList: replyIdList => {
          set(
            {
              selectedReplyIdList: replyIdList,
            },
            false,
            'updateReplyIdList',
          );
        },
        clearSelectedReplyIdList: () => {
          set(
            {
              selectedReplyIdList: [],
            },
            false,
            'clearSelectedReplyIdList',
          );
        },
        setOnboardingSelected: id => {
          set(
            {
              selectedOnboardingId: id,
            },
            false,
            'setOnboardingSelected',
          );
        },
        addOnboardingId: id => {
          set(
            produce<SelectionState>(state => {
              state.onboardingIdList.push(id);
            }),
            false,
            'addOnboardingId',
          );
        },
        removeOnboardingId: id => {
          set(
            produce<SelectionState>(state => {
              state.onboardingIdList = state.onboardingIdList.filter(
                _id => _id !== id,
              );
            }),
            false,
            'removeOnboardingId',
          );
        },
      })),
      {
        name: `botStudio.ChatAreaSelectionStore.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );
  return useSelectionStore;
};

export type SelectionStore = ReturnType<typeof createSelectionStore>;

export const subscribeSelectionUpdate = (
  store: {
    useMessagesStore: MessagesStore;
    useSelectionStore: SelectionStore;
  },
  eventCallback: ChatAreaEventCallback | null,
  lifeCycleService: SystemLifeCycleService,
) => {
  const { useMessagesStore, useSelectionStore } = store;

  return useSelectionStore.subscribe(
    state => state.selectedReplyIdList,
    async replyIdList => {
      const { messageGroupList, messages } = useMessagesStore.getState();

      const selectableMessageGroupList = messageGroupList.filter(
        messageGroup => messageGroup.selectable,
      );

      const selectedMessageGroupList = selectableMessageGroupList.filter(
        // The message cannot be selected while waiting sending responding, so the groupId must be reply_id
        messageGroup => replyIdList.includes(messageGroup.groupId),
      );

      const messageIdList = flatMessageGroupIdList(selectedMessageGroupList);

      const messageList = messages.filter(message =>
        messageIdList.includes(message.message_id),
      );

      const ctx = {
        messageList,
        replyIdList,
        checkedLength: replyIdList.length,
        isAllChecked:
          selectedMessageGroupList.length > 0 &&
          selectedMessageGroupList.length === selectableMessageGroupList.length,
      };

      eventCallback?.onSelectionChange?.(ctx);
      await lifeCycleService.command.onSelectionChange({
        ctx,
      });
    },
  );
};
