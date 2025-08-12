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

/* eslint-disable @typescript-eslint/naming-convention  */
import { isObject } from 'lodash-es';
import { type ContentType, type Message } from '@coze-common/chat-core';
import { globalVars } from '@coze-arch/web-context';
import {
  type ReportEvent,
  REPORT_EVENTS as ReportEventNames,
  createReportEvent,
} from '@coze-arch/report-events';
import { reporter } from '@coze-arch/logger';
import { CustomError } from '@coze-arch/bot-error';

// This code is copied from apps/bot/src/store/socket/utils.ts, and you can also consider unification in the future.
const hasSuggestion = (ext?: unknown) =>
  isObject(ext) && 'has_suggest' in ext && ext.has_suggest === '1';

interface ErrorPayload {
  reason: string;
  error?: Error;
}

const overtime = 120000;

export class MessageReportEvent {
  botID = '';

  private _timer?: ReturnType<typeof setTimeout>;

  private _receivingMessages = false;
  private _receivingSuggests = false;
  private _hasReceiveFirstChunk = false;
  private _hasReceiveFirstSuggestChunk = false;
  private _messageTotalContent = 0;

  private _executeDraftBotEvent?: ReportEvent;
  private _receiveMessagesEvent?: ReportEvent;
  private _messageReceiveSuggestsEvent?: ReportEvent;
  private _receiveTotalMessagesReportEvent?: ReportEvent;

  getLogID() {
    const logId = globalVars.LAST_EXECUTE_ID;
    return { log_id: logId };
  }

  getMetaCtx() {
    return {
      bot_id: this.botID,
      ...this.getLogID(),
    };
  }

  private _createExecuteDraftBotEvent = () =>
    createReportEvent({
      eventName: ReportEventNames.botDebugMessageSubmit,
      meta: this.getMetaCtx(),
    });
  private _createReceiveMessagesEvent = () =>
    createReportEvent({
      eventName: ReportEventNames.receiveMessage,
      meta: this.getMetaCtx(),
    });
  private _createMessageReceiveSuggestsEvent = () =>
    createReportEvent({
      eventName: ReportEventNames.messageReceiveSuggests,
      meta: this.getMetaCtx(),
    });
  private _createReceiveTotalMessagesEvent = () =>
    createReportEvent({
      eventName: ReportEventNames.receiveTotalMessages,
      meta: this.getMetaCtx(),
    });

  private _receiveMessagesEventGate = () => this._receivingMessages;
  private _messageReceiveSuggestsEventGate = () => this._receivingSuggests;

  private _clearTimeout() {
    if (!this._timer) {
      return;
    }
    clearTimeout(this._timer);
    this._timer = void 0;
  }

  interrupt() {
    this._clearTimeout();

    if (this._receivingMessages || this._receivingSuggests) {
      this._receiveTotalMessagesEvent.success();
      if (this._receivingMessages) {
        this.receiveMessageEvent.success();
      }
      if (this._receivingSuggests) {
        this.messageReceiveSuggestsEvent.success();
      }
    }
  }

  private _receiveTotalMessagesEvent = {
    start: () => {
      // interrupted
      this._receiveTotalMessagesReportEvent =
        this._createReceiveTotalMessagesEvent();
    },
    error: (reason: string) => {
      this._receiveTotalMessagesReportEvent?.addDurationPoint('failed');

      this._receiveTotalMessagesReportEvent?.error({
        reason,
      });
    },
    success: (allFinish = false) => {
      this._receiveTotalMessagesReportEvent?.addDurationPoint('success');
      this._receiveTotalMessagesReportEvent?.success({
        meta: {
          reply_has_finished: allFinish,
        },
      });
    },
    finish: () => {
      this._receiveTotalMessagesEvent?.success(true);
    },
  };

  messageReceiveSuggestsEvent = {
    start: () => {
      this._messageReceiveSuggestsEvent =
        this._createMessageReceiveSuggestsEvent();
      this._receivingSuggests = true;
      this._hasReceiveFirstSuggestChunk = false;
    },
    receiveSuggest: () => {
      if (!this._messageReceiveSuggestsEventGate()) {
        return;
      }

      if (!this._hasReceiveFirstSuggestChunk) {
        this._messageReceiveSuggestsEvent?.addDurationPoint('first');
        this._hasReceiveFirstSuggestChunk = true;
      }
    },
    success: () => {
      if (!this._messageReceiveSuggestsEventGate()) {
        return;
      }

      this._messageReceiveSuggestsEvent?.addDurationPoint('success');
      this._messageReceiveSuggestsEvent?.success({
        meta: {
          reply_has_finished: !this._receivingSuggests,
        },
      });
      this._receivingSuggests = false;
    },
    finish: () => {
      if (!this._messageReceiveSuggestsEventGate()) {
        return;
      }
      this.messageReceiveSuggestsEvent.success();
      this._receiveTotalMessagesEvent.finish();
    },
    error: ({ error, reason }: ErrorPayload) => {
      if (!this._messageReceiveSuggestsEventGate()) {
        return;
      }
      this._messageReceiveSuggestsEvent?.addDurationPoint('failed');
      this._messageReceiveSuggestsEvent?.error({ error, reason });
      this._receivingSuggests = false;
    },
  };

  receiveMessageEvent = {
    error: () => {
      if (!this._receiveMessagesEventGate()) {
        return;
      }
      this._receiveMessagesEvent?.addDurationPoint('failed');

      this._receivingMessages = false;
    },
    success: (allFinish = false) => {
      if (!this._receiveMessagesEventGate()) {
        return;
      }

      this._receiveMessagesEvent?.addDurationPoint('success');
      this._receiveMessagesEvent?.success({
        meta: {
          content_length: this._messageTotalContent,
          reply_has_finished: allFinish,
        },
      });
      this._receivingMessages = false;
    },
    start: () => {
      this._receiveMessagesEvent = this._createReceiveMessagesEvent();
      this._receivingMessages = true;
      this._hasReceiveFirstChunk = false;
      this._messageTotalContent = 0;
      this._timer = setTimeout(this.receiveMessageEvent.error, overtime);
    },
    receiveMessage: (message: Message<ContentType>) => {
      if (!this._receiveMessagesEventGate()) {
        return;
      }
      if (!message.content) {
        // Error event reporting with empty reply message
        reporter.errorEvent({
          eventName: ReportEventNames.emptyReceiveMessage,
          error: new CustomError(
            ReportEventNames.emptyReceiveMessage,
            message.content || 'empty content',
          ),
        });
      }
      this._messageTotalContent += message.content?.length ?? 0;

      if (this._hasReceiveFirstChunk) {
        return;
      }

      this._clearTimeout();
      this._receiveMessagesEvent?.addDurationPoint('first');
      this._hasReceiveFirstChunk = true;
    },

    finish: (message: Message<ContentType>) => {
      if (!this._receiveMessagesEventGate()) {
        return;
      }

      this.receiveMessageEvent.success(true);
      if ('ext' in message && hasSuggestion(message.ext)) {
        this.messageReceiveSuggestsEvent.start();
      } else {
        this._receiveTotalMessagesEvent.finish();
      }
    },
  };

  executeDraftBotEvent = {
    start: () => {
      this._executeDraftBotEvent = this._createExecuteDraftBotEvent();
      this.interrupt();
    },
    success: () => {
      this._executeDraftBotEvent?.addDurationPoint('finish');
      this._executeDraftBotEvent?.success({
        meta: {
          ...this.getLogID(),
        },
      });
      this._receiveTotalMessagesEvent.start();
      this.receiveMessageEvent.start();
    },
    error: ({ error, reason }: ErrorPayload) => {
      this._executeDraftBotEvent?.error({
        error,
        reason,
        meta: {
          ...this.getLogID(),
        },
      });
    },
  };

  start(botID: string) {
    this.botID = botID;
  }
}

export const messageReportEvent = new MessageReportEvent();
