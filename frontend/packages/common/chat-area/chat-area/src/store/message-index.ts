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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';
import { compareInt64 } from '@coze-common/chat-area-utils';

import { type Message } from './types';
import { type MessagesStore } from './messages';
import { getMessageIndexRange } from './action-implement/messages/get-message-index-range';

export interface MessageIndexState {
  // Ignore the pull chat history and message notification (for the home bot to continue the chat scene)
  ignoreIndexAndHistoryMessages: boolean;
  endIndex: string;
  readIndex: string;
  /** computed by MessagesStore */
  maxLoadIndex: string;

  prevHasMore: boolean;
  nextHasMore: boolean;
  cursor: string;
  nextCursor: string;

  scrollViewFarFromBottom: boolean;

  /**
   * 1. Preemptive loading process, the value is timestamp
   * 2. Verify asynchronous callbacks
   */
  loadLock: Record<LoadAction, number | null>;
  loadError: LoadAction[];
}

export type LoadAction =
  | 'load-next'
  | 'load-prev'
  | 'load-eagerly'
  | 'load-silently';

interface Indexes {
  endIndex?: string;
  readIndex?: string;
}

export type UpdateMessageIndex = (opt: Indexes) => void;
interface UpdateCursorParam {
  cursor?: string;
  nextCursor?: string;
}
interface UpdateHasMoreParam {
  prevHasMore?: boolean;
  nextHasMore?: boolean;
}

export interface MessageIndexAction {
  updateIgnoreIndexAndHistoryMessages: (
    ignoreIndexAndHistoryMessages: boolean,
  ) => void;
  /**
   * Take only larger values
   */
  updateIndex: UpdateMessageIndex;
  /** For use in subscribed messages only */
  privateUpdateLoadIndexRange: (max: string) => void;
  updateHasMore: (opt: UpdateHasMoreParam) => void;
  updateCursor: (opt: UpdateCursorParam) => void;
  resetCursors: () => void;
  resetHasMore: () => void;
  updateLockAndErrorByImmer: (
    updater: (state: MessageIndexState) => void,
  ) => void;
  setScrollViewFarFromBottom: (farAwayEnough: boolean) => void;
  resetLoadLockAndError: () => void;
  alignMessageIndexes: () => void;
  clearAll: () => void;
}

const getDefaultState = (): MessageIndexState => ({
  ignoreIndexAndHistoryMessages: false,
  endIndex: '0',
  readIndex: '0',
  maxLoadIndex: '0',
  prevHasMore: false,
  nextHasMore: false,
  cursor: '0',
  nextCursor: '0',
  scrollViewFarFromBottom: false,
  loadLock: {
    'load-eagerly': null,
    'load-next': null,
    'load-prev': null,
    'load-silently': null,
  },
  loadError: [],
});

/** Control via service/load-more module */
export const createMessageIndexStore = (mark: string) => {
  const useMessageIndexStore = create<MessageIndexState & MessageIndexAction>()(
    devtools(
      (set, get) => ({
        ...getDefaultState(),
        updateIgnoreIndexAndHistoryMessages: ignoreIndexAndHistoryMessages =>
          set(
            { ignoreIndexAndHistoryMessages },
            false,
            'updateIgnoreIndexAndHistoryMessages',
          ),
        updateIndex: newVal => {
          const curVal = get();
          const finalVal: Indexes = {};
          if (
            compareInt64(newVal.endIndex || '0').greaterThan(curVal.endIndex)
          ) {
            finalVal.endIndex = newVal.endIndex;
          }
          if (
            compareInt64(newVal.readIndex || '0').greaterThan(curVal.readIndex)
          ) {
            finalVal.readIndex = newVal.readIndex;
          }
          if (!Object.keys(finalVal).length) {
            return;
          }
          set(finalVal, false, 'updateIndex');
        },
        privateUpdateLoadIndexRange: max => {
          if (!compareInt64(max).greaterThan(get().maxLoadIndex)) {
            return;
          }
          set({ maxLoadIndex: max }, false, 'updateMaxLoadIndex');
        },
        updateHasMore: hasMore => set(hasMore, false, 'updateHasMore'),
        updateCursor: cursors => set(cursors, false, 'updateCursor'),
        updateLockAndErrorByImmer: updater =>
          set(produce<MessageIndexState>(updater), false, 'updateLockAndError'),
        setScrollViewFarFromBottom: farAwayEnough => {
          if (get().scrollViewFarFromBottom === farAwayEnough) {
            return;
          }
          set(
            { scrollViewFarFromBottom: farAwayEnough },
            false,
            'setScrollViewFarFromBottom',
          );
        },
        resetLoadLockAndError: () => {
          set(
            { loadLock: getDefaultState().loadLock, loadError: [] },
            false,
            'resetLoadLockAndError',
          );
        },
        resetCursors: () => {
          const state = getDefaultState();
          const cursors: Required<UpdateCursorParam> = {
            cursor: state.cursor,
            nextCursor: state.nextCursor,
          };
          set(cursors, false, 'resetCursor');
        },
        resetHasMore: () => {
          const state = getDefaultState();
          const hasMoreParam: Required<UpdateHasMoreParam> = {
            nextHasMore: state.nextHasMore,
            prevHasMore: state.prevHasMore,
          };
          set(hasMoreParam, false, 'resetHasMore');
        },
        alignMessageIndexes: () => {
          const { readIndex, endIndex } = get();
          if (readIndex === endIndex) {
            return;
          }
          let max = '';
          if (compareInt64(readIndex).greaterThan(endIndex)) {
            max = readIndex;
          } else {
            max = endIndex;
          }
          set({ readIndex: max, endIndex: max }, false, 'alignIndexes');
        },
        clearAll: () => {
          set(getDefaultState(), false, 'clearAll');
        },
      }),
      {
        name: `botStudio.ChatAreaMessageIndex.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

  return useMessageIndexStore;
};

export type MessageIndexStore = ReturnType<typeof createMessageIndexStore>;

export const subscribeMessageToUpdateMessageLoadIndex = (store: {
  useMessagesStore: MessagesStore;
  useMessageIndexStore: MessageIndexStore;
}): (() => void) => {
  const { useMessagesStore, useMessageIndexStore } = store;
  return useMessagesStore.subscribe(
    state => state.messages,
    messages => {
      updateMaxLoadIndexByMessages(messages, useMessageIndexStore);
    },
  );
};

const updateMaxLoadIndexByMessages = (
  messages: Message[],
  useMessageIndexStore: MessageIndexStore,
) => {
  const { max = '0' } = getMessageIndexRange(messages) || {};
  useMessageIndexStore.getState().privateUpdateLoadIndexRange(max);
};
