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
import { type GetConversationParticipantsReadIndexResponse } from '@coze-arch/bot-api/developer_api';
import { type ScrollViewController } from '@coze-common/scroll-view';
import {
  type GetHistoryMessageResponse,
  type LoadDirection,
} from '@coze-common/chat-core';
import type ChatCore from '@coze-common/chat-core';
import { Deferred } from '@coze-common/chat-area-utils';

import { getFakeChatCore, getIsFakeChatCore } from '../../utils/fake-chat-core';
import {
  type MessageIndexAction,
  type MessageIndexState,
} from '../../store/message-index';
import { MessageIndexHelper } from './helper/message-index-helper';
import { LoadLockErrorHelper } from './helper/load-lock-error-helper';

export type LoadMoreEnvValues = {
  enableTwoWayLoad: boolean;
  enableMarkRead: boolean;
  /** Sending or receiving a reply */
  isProcessingChat: boolean;
} & MessageIndexState;

export type CommonLoadIndex = Pick<
  GetHistoryMessageResponse,
  'hasmore' | 'next_cursor' | 'cursor' | 'next_has_more' | 'read_message_index'
>;

type ListenProcessChatStateChange = (fn: (isProcessing: boolean) => void) => {
  dispose: () => void;
};

export type LoadMoreEnvConstructParams = Pick<
  LoadMoreEnvTools,
  | 'readEnvValues'
  | 'loadRequest'
  | 'requestMessageIndex'
  | 'insertMessages'
  | 'reporter'
  | 'updateIndex'
  | 'updateCursor'
  | 'updateHasMore'
  | 'resetCursors'
  | 'resetHasMore'
  | 'alignMessageIndexes'
  | 'resetLoadLockAndError'
  | 'updateLockAndErrorByImmer'
  | 'waitMessagesLengthChangeLayoutEffect'
  | 'clearMessageIndexStore'
> & {
  listenProcessChatStateChange: ListenProcessChatStateChange;
};

export type GetScrollController = () => ScrollViewController | null;

export class LoadMoreEnvTools {
  public loadRequest: (param: {
    count?: number;
    cursor: string;
    loadDirection: LoadDirection;
  }) => Promise<GetHistoryMessageResponse>;
  public waitMessagesLengthChangeLayoutEffect: (fn: () => void) => void;
  public requestMessageIndex: (
    conversationId: string | null,
  ) => Promise<
    Pick<
      GetConversationParticipantsReadIndexResponse,
      'end_message_index' | 'read_message_index'
    >
  >;
  public readEnvValues: () => LoadMoreEnvValues;
  /** Update only when a larger value appears, call it casually */
  public updateIndex: MessageIndexAction['updateIndex'];
  public insertMessages: (
    param: GetHistoryMessageResponse,
    opt: { toLatest: boolean; clearFirst?: boolean },
  ) => void;
  public updateHasMore: MessageIndexAction['updateHasMore'];
  public updateCursor: MessageIndexAction['updateCursor'];
  public resetCursors: MessageIndexAction['resetCursors'];
  public resetHasMore: MessageIndexAction['resetHasMore'];
  public resetLoadLockAndError: MessageIndexAction['resetLoadLockAndError'];
  public alignMessageIndexes: MessageIndexAction['alignMessageIndexes'];
  public updateLockAndErrorByImmer: MessageIndexAction['updateLockAndErrorByImmer'];
  public getScrollController: GetScrollController;
  public clearMessageIndexStore: MessageIndexAction['clearAll'];
  public chatCore: ChatCore;
  public reporter: Reporter;
  public loadLockErrorHelper = new LoadLockErrorHelper(this);
  public messageIndexHelper = new MessageIndexHelper(this);
  private listenProcessChatStateChange: ListenProcessChatStateChange;
  private chatCoreDeferred = new Deferred();

  public injectGetScrollController = (fn: GetScrollController) => {
    this.getScrollController = fn;
  };
  public injectChatCore = (core: ChatCore) => {
    this.chatCore = core;
    this.chatCoreDeferred.resolve();
  };

  public async waitChatProcessFinish() {
    if (!this.readEnvValues().isProcessingChat) {
      return;
    }
    return new Promise<void>(resolve => {
      const { dispose } = this.listenProcessChatStateChange(isProcessing => {
        if (!isProcessing) {
          dispose();
          resolve();
        }
      });
    });
  }

  public waitChatCoreReady() {
    if (getIsFakeChatCore(this.chatCore)) {
      return this.chatCoreDeferred;
    }
  }

  constructor({
    loadRequest,
    readEnvValues,
    updateIndex,
    insertMessages,
    updateHasMore,
    updateCursor,
    reporter,
    updateLockAndErrorByImmer,
    requestMessageIndex,
    waitMessagesLengthChangeLayoutEffect,
    listenProcessChatStateChange,
    alignMessageIndexes,
    resetCursors,
    resetHasMore,
    resetLoadLockAndError,
    clearMessageIndexStore,
  }: LoadMoreEnvConstructParams) {
    this.getScrollController = () => null;
    this.chatCore = getFakeChatCore();
    this.insertMessages = insertMessages;
    this.updateIndex = updateIndex;
    this.updateHasMore = updateHasMore;
    this.updateCursor = updateCursor;
    this.readEnvValues = readEnvValues;
    this.loadRequest = loadRequest;
    this.requestMessageIndex = requestMessageIndex;
    this.reporter = reporter;
    this.resetHasMore = resetHasMore;
    this.resetCursors = resetCursors;
    this.alignMessageIndexes = alignMessageIndexes;
    this.updateLockAndErrorByImmer = updateLockAndErrorByImmer;
    this.resetLoadLockAndError = resetLoadLockAndError;
    this.waitMessagesLengthChangeLayoutEffect =
      waitMessagesLengthChangeLayoutEffect;
    this.listenProcessChatStateChange = listenProcessChatStateChange;
    this.clearMessageIndexStore = clearMessageIndexStore;
  }
}
