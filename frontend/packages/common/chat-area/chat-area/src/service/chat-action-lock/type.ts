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

import { type Reporter } from '@coze-arch/logger';

import {
  type GlobalActionType,
  type GlobalActionLock,
  type GlobalActionLockUpdateFn,
  type AnswerActionLockMapUpdateFn,
  type AnswerActionLockMap,
  type ChatActionStoreAction,
} from '../../store/chat-action';

export interface GlobalLockParamsMap {
  sendMessageToACK: { messageUniqKey: string };
  clearHistory: null;
  clearContext: null;
}

export type GetGlobalActionLockUpdateFn<T extends GlobalActionType> = (props: {
  timestamp: number;
  param: GlobalLockParamsMap[T];
}) => GlobalActionLockUpdateFn;

export type GetIsGlobalActionLockFn = (
  globalActionLock: GlobalActionLock,
) => boolean;

export type GetAnswerActionLockUpdateFn = (
  groupId: string,
  props: {
    timestamp: number;
  },
) => AnswerActionLockMapUpdateFn;

export type GetAnswerActionUnLockUpdateFn = (
  groupId: string,
) => AnswerActionLockMapUpdateFn;

export type GetIsAnswerActionLockFn = (
  groupId: string,
  answerActionLockMap: AnswerActionLockMap,
  globalActionLock: GlobalActionLock,
) => boolean;

export interface ChatActionLockEnvValues {
  enableChatActionLock: boolean;
}

export interface ChatActionLockServiceConstructor {
  updateGlobalActionLockByImmer: ChatActionStoreAction['updateGlobalActionLockByImmer'];
  getGlobalActionLock: ChatActionStoreAction['getGlobalActionLock'];
  updateAnswerActionLockMapByImmer: ChatActionStoreAction['updateAnswerActionLockMapByImmer'];
  getAnswerActionLockMap: ChatActionStoreAction['getAnswerActionLockMap'];
  readEnvValues: () => ChatActionLockEnvValues;
  reporter: Pick<Reporter, 'info'>;
}
