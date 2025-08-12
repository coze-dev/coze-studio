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

import { createWithEqualityFn } from 'zustand/traditional';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { produce } from 'immer';

import { proxyFreeze } from '../utils/proxy-freeze';
import {
  findMessageGroupById,
  findMessageGroupByUserMessageId,
} from '../utils/message-group/message-group';
import {
  findMessageById,
  findMessageByIdStruct,
  findMessageIndexById,
  findMessageIndexByIdStruct,
  getMessageUniqueKey,
} from '../utils/message';
import { type OnBeforeMessageGroupListUpdateContext } from '../plugin/types/plugin-class/message-life-cycle';
import { type SystemLifeCycleService } from '../plugin/life-cycle';
import { type ChatAreaEventCallback } from '../context/chat-area-context/chat-area-callback';
import {
  type Message,
  type MessageGroup,
  type MessageIdStruct,
  type MessagePagination,
} from './types';
import { type SectionIdStore } from './section-id';
import { scanAndMarkShowSuggestions } from './helpers/scan-meta-suggestions';
import { groupMessageList } from './helpers/group-message-list';
import { updateLatestMessageGroupContextDivider } from './helpers/get-latest-message-group-context-divider';
import { filterDeduplicateMessage } from './helpers/add-message-deduplicate';
import { getUpdateMessage } from './action-implement/messages/update-message';
import { getMessageIndexRange } from './action-implement/messages/get-message-index-range';

export type MessageStoreStateAction = MessageStoreState & MessageStoreAction;

export interface MessageStoreState {
  messages: Message[];
  /** @Deprecated replaced with messageIndexStore */
  pagination: MessagePagination;
  // computed
  messageGroupList: MessageGroup[];
}

export interface UpdateMessage {
  (id: string | MessageIdStruct, newMessage: Message): void;
  (message: Message, PLACEHOLDER?: never): void;
}

export interface MessageIndexRange {
  min: string | undefined;
  max: string | undefined;
  withNoIndexed: boolean;
}

interface MessageStoreAction {
  findMessage: (idStruct: string | MessageIdStruct) => Message | undefined;
  hasMessage: (idStruct: string | MessageIdStruct) => boolean;
  updateMessage: UpdateMessage;
  /** Note that it is message_index field, not index */
  getMessageIndexRange: () => MessageIndexRange;
  /**
   * Pay attention to the reverse order of the message display.
   * ! If you use this method to add message records, you need to determine whether you are adding chat history fixHistoryMessageList
   */
  addMessages: (
    messages: Message[],
    option?: { clearFirst?: boolean; toLatest?: boolean },
  ) => void;
  /**
   * Ditto
   */
  addMessage: (message: Message) => void;
  deleteMessageByIdStruct: (message: MessageIdStruct) => void;
  deleteMessageById: (id: string) => void;

  deleteMessageByIdList: (idList: string[]) => void;
  setGroupMessageList: (messageGroupList: MessageGroup[]) => void;
  updateMessageGroupByImmer: (
    updater: (messageGroupList: MessageGroup[]) => void,
  ) => void;

  getMessageGroupById: (groupId: string) => MessageGroup | undefined;
  getMessageGroupByUserMessageId: (
    userMessageId: string,
  ) => MessageGroup | undefined;

  isLastMessageGroup: (groupId: string) => boolean;

  clearMessage: () => void;
  clearMessageStore: () => void;
}

const getDefaultPagination = (): MessageStoreState['pagination'] => ({
  hasMore: false,
  cursor: '0',
});
const getDefaultState = (): MessageStoreState => ({
  messageGroupList: [],
  messages: [],
  pagination: getDefaultPagination(),
});

// eslint-disable-next-line max-lines-per-function -- TODO: Let's see how to take it apart later...
export const createMessagesStore = (mark: string) => {
  const useMessagesStore = createWithEqualityFn<
    MessageStoreState & MessageStoreAction
  >()(
    devtools(
      // eslint-disable-next-line max-lines-per-function -- can't be dismantled in the store -- nonsense, I dismantled one
      subscribeWithSelector((set, get) => ({
        ...getDefaultState(),
        findMessage: idOrStruct => {
          const { messages } = get();
          if (typeof idOrStruct === 'string') {
            return findMessageById(messages, idOrStruct);
          }
          return findMessageByIdStruct(messages, idOrStruct);
        },
        hasMessage: idOrStruct => {
          const { messages } = get();
          if (typeof idOrStruct === 'string') {
            return !!findMessageById(messages, idOrStruct);
          }
          return !!findMessageByIdStruct(messages, idOrStruct);
        },
        updateMessage: getUpdateMessage(set),
        addMessage: message => {
          set(
            produce<MessageStoreState>(state => {
              if (findMessageByIdStruct(state.messages, message)) {
                // TODO: throw error attention serialization
                console.error('unexpected addMessage duplicate');
                return;
              }
              state.messages.unshift(message);
            }),
            false,
            'addMessage',
          );
        },
        addMessages: (
          addedMessages,
          { clearFirst = false, toLatest = false } = {},
        ) => {
          // Do not use immer here, there will be performance issues according to the current implementation
          set(
            state => {
              if (clearFirst) {
                return { messages: addedMessages };
              }
              const all = state.messages;
              const deduplicated = filterDeduplicateMessage(all, addedMessages);
              const messages = toLatest
                ? deduplicated.concat(all)
                : all.concat(deduplicated);
              return { messages };
            },
            false,
            'addMessages',
          );
        },
        deleteMessageByIdStruct: idStruct => {
          set(
            produce<MessageStoreState>(state => {
              const idx = findMessageIndexByIdStruct(state.messages, idStruct);
              if (idx < 0) {
                // TODO: throw error attention serialization; supplementary reporting
                console.error(`cannot find message ${idStruct.message_id}`);
                return;
              }
              state.messages.splice(idx, 1);
            }),
            false,
            'deleteMessageByIdStruct',
          );
        },
        deleteMessageById: id => {
          set(
            produce<MessageStoreState>(state => {
              const idx = findMessageIndexById(state.messages, id);
              if (idx < 0) {
                // TODO: Supplementary reporting
                console.error(`cannot find message ${id}`);
                return;
              }
              state.messages.splice(idx, 1);
            }),
            false,
            'deleteMessageById',
          );
        },
        deleteMessageByIdList: idList => {
          set(
            {
              messages: get().messages.filter(
                message =>
                  idList.findIndex(id => id === getMessageUniqueKey(message)) <
                  0,
              ),
            },
            false,
            'deleteMessageByIdList',
          );
        },
        setGroupMessageList: messageGroupList => {
          set({ messageGroupList }, false, 'setGroupMessageList');
        },
        updateMessageGroupByImmer: updater => {
          set(
            produce<MessageStoreState>(state =>
              updater(state.messageGroupList),
            ),
            false,
            'updateMessageGroupByImmer',
          );
        },
        getMessageIndexRange: () => getMessageIndexRange(get().messages),
        getMessageGroupById: groupId =>
          findMessageGroupById(get().messageGroupList, groupId),
        getMessageGroupByUserMessageId: userMessageId =>
          findMessageGroupByUserMessageId(
            get().messageGroupList,
            userMessageId,
          ),

        isLastMessageGroup: groupId => {
          const { messageGroupList } = get();
          const latestGroup = messageGroupList.at(0);
          return latestGroup?.groupId === groupId;
        },
        clearMessage: () => {
          get().clearMessageStore();
        },
        clearMessageStore: () => {
          set(getDefaultState(), false, 'clearAll');
        },
      })),
      {
        name: `botStudio.ChatAreaMessage.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

  return useMessagesStore;
};

export type MessagesStore = ReturnType<typeof createMessagesStore>;

export const subscribeSectionIdToUpdateMessageGroup = (store: {
  useSectionIdStore: SectionIdStore;
  useMessagesStore: MessagesStore;
}) => {
  const { useMessagesStore, useSectionIdStore } = store;

  return useSectionIdStore.subscribe(
    state => state.latestSectionId,
    latestSectionId => {
      const { updateMessageGroupByImmer, messages } =
        useMessagesStore.getState();

      updateMessageGroupByImmer(messageGroupList => {
        updateLatestMessageGroupContextDivider({
          messageGroupList,
          latestSectionId,
          messageList: messages,
        });

        // Only after processing the contextDivider can you scan for suggestions
        scanAndMarkShowSuggestions(messageGroupList);
      });
    },
  );
};

export const subscribeMessageToUpdateMessageGroup = (
  store: {
    useSectionIdStore: SectionIdStore;
    useMessagesStore: MessagesStore;
  },
  eventCallback: ChatAreaEventCallback | null,
  lifeCycleService: SystemLifeCycleService,
) => {
  const { useMessagesStore, useSectionIdStore } = store;

  return useMessagesStore.subscribe(
    state => state.messages,
    messages => {
      const { latestSectionId } = useSectionIdStore.getState();
      const messageGroupList = groupMessageList(messages, lifeCycleService);

      updateLatestMessageGroupContextDivider({
        messageGroupList,
        latestSectionId,
        messageList: messages,
      });

      // Only after processing the contextDivider can you scan for suggestions
      scanAndMarkShowSuggestions(messageGroupList);

      const modifiedGroup = eventCallback?.onBeforeMessageGroupListUpdate?.(
        proxyFreeze(messageGroupList),
        proxyFreeze(messages),
      );

      const proxyFreezeContext: OnBeforeMessageGroupListUpdateContext =
        proxyFreeze({
          messageGroupList: modifiedGroup ?? messageGroupList,
        });

      const { messageGroupList: finalMessageGroupList } =
        lifeCycleService.message.onBeforeMessageGroupListUpdate({
          ctx: proxyFreezeContext,
        });

      useMessagesStore
        .getState()
        .setGroupMessageList(finalMessageGroupList ?? messageGroupList);
    },
  );
};
