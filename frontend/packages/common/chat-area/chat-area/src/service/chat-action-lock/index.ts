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
  type AnswerActionType,
  type ChatActionStoreAction,
  type GlobalActionType,
} from '../../store/chat-action';
import {
  type ChatActionLockEnvValues,
  type ChatActionLockServiceConstructor,
  type GlobalLockParamsMap,
} from './type';
import {
  answerActionLockUpdateFnMap,
  answerActionUnLockUpdateFnMap,
  getIsAnswerActionLockMap,
  getIsGlobalActionLockMap,
  globalActionLockUpdateFnMap,
  globalActionUnLockUpdateFnMap,
} from './helper/action-lock-map';

export class ChatActionLockService {
  private updateGlobalActionLockByImmer: ChatActionStoreAction['updateGlobalActionLockByImmer'];
  private getGlobalActionLock: ChatActionStoreAction['getGlobalActionLock'];
  private updateAnswerActionLockMapByImmer: ChatActionStoreAction['updateAnswerActionLockMapByImmer'];
  private getAnswerActionLockMap: ChatActionStoreAction['getAnswerActionLockMap'];
  private readEnvValues: () => ChatActionLockEnvValues;
  private getIsEnableLock = () => this.readEnvValues().enableChatActionLock;
  private reporter: Pick<Reporter, 'info'>;

  constructor({
    updateAnswerActionLockMapByImmer,
    updateGlobalActionLockByImmer,
    getAnswerActionLockMap,
    getGlobalActionLock,
    readEnvValues,
    reporter,
  }: ChatActionLockServiceConstructor) {
    this.updateAnswerActionLockMapByImmer = updateAnswerActionLockMapByImmer;
    this.updateGlobalActionLockByImmer = updateGlobalActionLockByImmer;
    this.getAnswerActionLockMap = getAnswerActionLockMap;
    this.getGlobalActionLock = getGlobalActionLock;
    this.readEnvValues = readEnvValues;
    this.reporter = reporter;
  }

  public globalAction = {
    lock: <T extends GlobalActionType>(
      action: T,
      param: GlobalLockParamsMap[T],
    ): number => {
      const timestamp = Date.now();
      if (!this.getIsEnableLock()) {
        return timestamp;
      }

      const updateFn = globalActionLockUpdateFnMap[action]({
        timestamp,
        param,
      });

      this.updateGlobalActionLockByImmer(updateFn);
      this.reporter.info({
        message: `[chat-area] global action lock: ${action}`,
      });
      return timestamp;
    },
    unlock: (action: GlobalActionType): void => {
      const updateFn = globalActionUnLockUpdateFnMap[action];
      this.updateGlobalActionLockByImmer(updateFn);
      this.reporter.info({
        message: `[chat-area] global action unlock, action: ${action}`,
      });
    },

    getIsLock: (action: GlobalActionType): boolean => {
      const globalActionLock = this.getGlobalActionLock();
      return getIsGlobalActionLockMap[action](globalActionLock);
    },
  };

  public answerAction = {
    lock: (groupId: string, action: AnswerActionType): number => {
      const timestamp = Date.now();
      if (!this.getIsEnableLock()) {
        return timestamp;
      }
      const actionLockUpdateFn = answerActionLockUpdateFnMap[action](groupId, {
        timestamp,
      });

      this.updateAnswerActionLockMapByImmer(actionLockUpdateFn);
      this.reporter.info({
        message: `[chat-area] answer action lock, action: ${action} groupId: ${groupId}`,
      });
      return timestamp;
    },
    unlock: (groupId: string, action: AnswerActionType): void => {
      const actionLockUpdateFn = answerActionUnLockUpdateFnMap[action](groupId);
      this.updateAnswerActionLockMapByImmer(actionLockUpdateFn);
      this.reporter.info({
        message: `[chat-area] answer action unlock, action: ${action} groupId: ${groupId}`,
      });
    },
    getIsLock: (groupId: string, action: AnswerActionType): boolean => {
      const globalActionLock = this.getGlobalActionLock();
      const lockMap = this.getAnswerActionLockMap();
      return getIsAnswerActionLockMap[action](
        groupId,
        lockMap,
        globalActionLock,
      );
    },
  };
}

export const fallbackChatActionLockService = new ChatActionLockService({
  updateGlobalActionLockByImmer: () => ({}),
  getGlobalActionLock: () => ({
    sendMessageToACK: null,
    clearContext: null,
    clearHistory: null,
  }),
  updateAnswerActionLockMapByImmer: () => ({}),
  getAnswerActionLockMap: () => ({}),
  readEnvValues: () => ({
    enableChatActionLock: false,
  }),
  reporter: {
    info: () => ({}),
  },
});
