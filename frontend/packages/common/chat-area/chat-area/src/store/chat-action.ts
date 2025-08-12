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
import { isUndefined, merge, omitBy } from 'lodash-es';
import { produce } from 'immer';

export type ActionLock = {
  /**
   * Data.now()
   */
  timestamp: number;
} | null;

export interface GlobalActionLock {
  sendMessageToACK: {
    messageUniqKey: string | null;
    timestamp: number;
  } | null;

  clearHistory: ActionLock;

  clearContext: ActionLock;
}

export interface AnswerActionLock {
  deleteMessageGroup: ActionLock;
  regenerate: ActionLock;
}

export type GlobalActionType = keyof GlobalActionLock;

export type AnswerActionType = keyof AnswerActionLock;

type GroupId = string;

export type AnswerActionLockMap = Record<GroupId, AnswerActionLock>;

export interface ChatActionState {
  globalActionLock: GlobalActionLock;
  answerActionLockMap: AnswerActionLockMap;
}

export type GlobalActionLockUpdateFn = (lock: GlobalActionLock) => void;
export type AnswerActionLockMapUpdateFn = (
  lockMap: AnswerActionLockMap,
) => void;

export interface ChatActionStoreAction {
  updateGlobalActionLockByImmer: (updateFn: GlobalActionLockUpdateFn) => void;
  updateGlobalActionLockOnlyDefined: (
    globalActionLock: Partial<GlobalActionLock>,
  ) => void;
  updateAnswerActionLockMapOnlyDefined: (
    groupId: GroupId,
    answerActionLock: Partial<AnswerActionLock>,
  ) => void;
  updateAnswerActionLockMapByImmer: (
    updateFn: AnswerActionLockMapUpdateFn,
  ) => void;
  getGlobalActionLock: () => GlobalActionLock;
  getAnswerActionLockMap: () => AnswerActionLockMap;
  clearAll: () => void;
}

const getDefaultState: () => ChatActionState = () => ({
  answerActionLockMap: {},
  globalActionLock: {
    clearContext: null,
    clearHistory: null,
    sendMessageToACK: null,
  },
});

export const createChatActionStore = (mark: string) =>
  create<ChatActionState & ChatActionStoreAction>()(
    devtools(
      (set, get) => ({
        ...getDefaultState(),
        updateAnswerActionLockMapByImmer(updateFn) {
          set(
            state => ({
              answerActionLockMap: produce<AnswerActionLockMap>(
                state.answerActionLockMap,
                updateFn,
              ),
            }),
            false,
            'updateAnswerActionLockMapByImmer',
          );
        },
        updateGlobalActionLockOnlyDefined: inputActionLock => {
          set(
            {
              globalActionLock: merge(
                {},
                get().globalActionLock,
                omitBy(inputActionLock, isUndefined),
              ),
            },
            false,
            'updateGlobalActionLockOnlyDefined',
          );
        },
        updateAnswerActionLockMapOnlyDefined: (groupId, inputActionLock) => {
          set(
            state => ({
              answerActionLockMap: produce<AnswerActionLockMap>(
                state.answerActionLockMap,
                draft => {
                  const targetGroupLock = draft[groupId];
                  const definedActionLock = omitBy(
                    inputActionLock,
                    isUndefined,
                  );

                  if (!targetGroupLock) {
                    draft[groupId] = merge(
                      {},
                      { deleteMessageGroup: null, regenerate: null },
                      definedActionLock,
                    );
                    return;
                  }
                  draft[groupId] = merge(
                    {},
                    targetGroupLock,
                    definedActionLock,
                  );
                },
              ),
            }),
            false,
            'updateAnswerActionLockMapOnlyDefined',
          );
        },
        updateGlobalActionLockByImmer(updateFn) {
          set(
            state => ({
              globalActionLock: produce<GlobalActionLock>(
                state.globalActionLock,
                updateFn,
              ),
            }),
            false,
            'updateGlobalActionLockByImmer',
          );
        },
        getAnswerActionLockMap: () => get().answerActionLockMap,
        getGlobalActionLock: () => get().globalActionLock,
        clearAll: () => set(getDefaultState(), false, 'clearAll'),
      }),
      {
        enabled: IS_DEV_MODE,
        name: `botStudio.ChatAreaAction.${mark}`,
      },
    ),
  );

export type ChatActionStore = ReturnType<typeof createChatActionStore>;
