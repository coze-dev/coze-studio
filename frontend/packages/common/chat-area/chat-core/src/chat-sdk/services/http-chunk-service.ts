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

import type EventEmitter from 'eventemitter3';

import { type ReportLog } from '@/report-log';
import { PreSendLocalMessageEventsEnum } from '@/message/types';
import { type PreSendLocalMessageEventsManager } from '@/message/presend-local-message/presend-local-message-events-manager';
import { type ChunkProcessor } from '@/message';
import { ChatCoreError } from '@/custom-error';
import type {
  ErrorInfo,
  MessageLifecycleCallbackParams,
  OnMessageCallbackParams,
} from '@/channel/http-chunk/types';
import { HttpChunkEvents } from '@/channel/http-chunk/events/http-chunk-events';
import { type HttpChunk } from '@/channel/http-chunk';

import {
  type PullingStatus,
  type SdkEventsCallbackMap,
  SdkEventsEnum,
} from '../types/interface';
import { type ReportEventsTracer } from '../events/slardar-events';

export interface HttpChunkServiceProps {
  httpChunk: HttpChunk;
  reportLogWithScope: ReportLog;
  chunkProcessor: ChunkProcessor;
  preSendLocalMessageEventsManager: PreSendLocalMessageEventsManager;
  chatSdkEventEmit: <T extends SdkEventsEnum>(
    event: T,
    ...args: Parameters<SdkEventsCallbackMap[T]>
  ) => void;
  chatSdkEventBus: EventEmitter<SdkEventsEnum>;
  reportEventsTracer: ReportEventsTracer;
}
export class HttpChunkService {
  httpChunk: HttpChunk;
  reportLogWithScope: ReportLog;
  chunkProcessor: ChunkProcessor;
  preSendLocalMessageEventsManager: PreSendLocalMessageEventsManager;
  chatSdkEventEmit: <T extends SdkEventsEnum>(
    event: T,
    ...args: Parameters<SdkEventsCallbackMap[T]>
  ) => void;
  chatSdkEventBus: EventEmitter<SdkEventsEnum>;
  reportEventsTracer: ReportEventsTracer;
  constructor({
    httpChunk,
    reportLogWithScope,
    chunkProcessor,
    preSendLocalMessageEventsManager,
    chatSdkEventEmit,
    chatSdkEventBus,
    reportEventsTracer,
  }: HttpChunkServiceProps) {
    this.httpChunk = httpChunk;
    this.reportLogWithScope = reportLogWithScope;
    this.chunkProcessor = chunkProcessor;
    this.preSendLocalMessageEventsManager = preSendLocalMessageEventsManager;
    this.chatSdkEventEmit = chatSdkEventEmit;
    this.reportEventsTracer = reportEventsTracer;
    this.chatSdkEventBus = chatSdkEventBus;
  }
  /**
   * Handle events listened to by the channel
   */
  onHttpChunkEvents() {
    this.httpChunk.on(
      HttpChunkEvents.FETCH_START,
      this.handleHttpChunkFetchStart,
    );
    // read stream
    this.httpChunk.on(
      HttpChunkEvents.MESSAGE_RECEIVED,
      this.handleHttpChunkMessageReceived,
    );
    // Overall flow success
    this.httpChunk.on(
      HttpChunkEvents.ALL_SUCCESS,
      this.handleHttpChunkStreamSuccess,
    );
    // Start reading stream
    this.httpChunk.on(
      HttpChunkEvents.READ_STREAM_START,
      this.handleHttpChunkReadStreamStart,
    );
    // Fetch phase exception, not yet reached the read stream phase
    this.httpChunk.on(
      HttpChunkEvents.FETCH_ERROR,
      this.handleHttpChunkFetchError,
    );
    this.httpChunk.on(
      HttpChunkEvents.READ_STREAM_ERROR,
      this.handleReadStreamError,
    );
    // Private room timeout
    this.httpChunk.on(
      HttpChunkEvents.BETWEEN_CHUNK_TIMEOUT,
      this.handleHttpChunkTimeout,
    );
  }

  private handleHttpChunkFetchStart = ({
    localMessageID,
  }: MessageLifecycleCallbackParams) => {
    this.reportEventsTracer?.pullStreamTracer?.start(localMessageID);
  };

  private handleHttpChunkMessageReceived = (
    receiveMessage: OnMessageCallbackParams,
  ) => {
    const { chunk, logID } = receiveMessage;
    const ackMessage = this.chunkProcessor.getAckMessageByChunk(chunk);
    const { local_message_id = '' } =
      ackMessage?.extra_info || receiveMessage.chunk.message.extra_info;

    let pullingStatus: PullingStatus = 'pulling';
    // Is it the final answer?
    if (this.chunkProcessor.isMessageAnswerEnd(chunk)) {
      pullingStatus = 'answerEnd';
    }

    this.chatSdkEventEmit(SdkEventsEnum.MESSAGE_PULLING_STATUS, {
      name: SdkEventsEnum.MESSAGE_PULLING_STATUS,
      data: {
        pullingStatus,
        local_message_id,
        reply_id: receiveMessage.chunk.message.reply_id || '',
      },
    });

    const hasOnMessage = this.chatSdkEventBus
      .eventNames()
      .includes(SdkEventsEnum.MESSAGE_RECEIVED_AND_UPDATE);

    // Determine whether the received message already exists
    if (this.chunkProcessor.isFirstReplyMessage(chunk)) {
      this.reportEventsTracer?.pullStreamTracer?.receiveFirstAnsChunk(
        local_message_id,
        {
          logId: logID,
        },
      );
    }
    this.chunkProcessor.addChunkAndProcess(chunk, {
      logId: logID,
    });
    const processedMessage =
      this.chunkProcessor.getProcessedMessageByChunk(chunk);

    hasOnMessage &&
      this.reportLogWithScope.info({
        message: '消息接收&更新',
        meta: {
          logMessageWithDebugInfo:
            this.chunkProcessor.appendDebugMessage(processedMessage),
        },
      });

    if (chunk.message.type === 'ack') {
      this.reportEventsTracer?.pullStreamTracer?.receiveAck(local_message_id, {
        logId: logID,
      });
      this.preSendLocalMessageEventsManager.emit(
        PreSendLocalMessageEventsEnum.MESSAGE_SEND_SUCCESS,
        processedMessage,
      );
      return;
    }

    this.chatSdkEventEmit(SdkEventsEnum.MESSAGE_RECEIVED_AND_UPDATE, {
      name: SdkEventsEnum.MESSAGE_RECEIVED_AND_UPDATE,
      data: [processedMessage],
    });
  };

  // read stream exception
  private handleReadStreamError = (errorInfo: ErrorInfo) => {
    const {
      ext: {
        localMessageID: local_message_id = '',
        replyID: reply_id = '',
        logID: logId = '',
      } = {},
      code,
      msg,
    } = errorInfo;

    const chatCoreError = new ChatCoreError(msg, {
      code,
      local_message_id,
      logId,
      reply_id,
      rawError: errorInfo,
    });

    const stashedAckMessage =
      this.chunkProcessor.getAckMessageByLocalMessageId(local_message_id);

    // The read stream is abnormal, do you want to distinguish between receiving it in the first package?
    if (!stashedAckMessage) {
      this.preSendLocalMessageEventsManager.emit(
        PreSendLocalMessageEventsEnum.MESSAGE_SEND_FAIL,
        chatCoreError,
      );
      return;
    }

    // If the message is sent successfully, it means that the pull phase failed.
    if (stashedAckMessage) {
      this.chatSdkEventEmit(SdkEventsEnum.MESSAGE_PULLING_STATUS, {
        name: SdkEventsEnum.MESSAGE_PULLING_STATUS,
        data: {
          pullingStatus: 'error',
          local_message_id,
          reply_id,
        },
        error: chatCoreError,
      });
    }
    const contentLength =
      this.chunkProcessor.getReplyMessagesLengthByReplyId(reply_id);
    this.reportEventsTracer?.pullStreamTracer?.error(chatCoreError, {
      contentLength,
    });
  };

  // Fetch is abnormal, it has not yet reached the pull flow stage
  private handleHttpChunkFetchError = (errorInfo: ErrorInfo) => {
    const {
      ext: {
        localMessageID: local_message_id = '',
        replyID: reply_id = '',
        logID: logId = '',
      } = {},
      code,
      msg,
    } = errorInfo;

    const chatCoreError = new ChatCoreError(msg, {
      code,
      local_message_id,
      logId,
      reply_id,
      rawError: errorInfo,
    });
    this.preSendLocalMessageEventsManager.emit(
      PreSendLocalMessageEventsEnum.MESSAGE_SEND_FAIL,
      chatCoreError,
    );
  };

  private handleHttpChunkStreamSuccess = ({
    localMessageID,
    replyID,
  }: MessageLifecycleCallbackParams) => {
    this.chatSdkEventEmit(SdkEventsEnum.MESSAGE_PULLING_STATUS, {
      name: SdkEventsEnum.MESSAGE_PULLING_STATUS,
      data: {
        pullingStatus: 'success',
        local_message_id: localMessageID,
        reply_id: replyID || '',
      },
    });
    const contentLength =
      replyID && this.chunkProcessor.getReplyMessagesLengthByReplyId(replyID);
    this.reportEventsTracer?.pullStreamTracer?.success(localMessageID, {
      contentLength,
    });
    this.reportLogWithScope.info({
      message: '拉取回复完成',
      meta: {
        local_message_id: localMessageID,
        reply_id: replyID || '',
        streamBuffer: this.chunkProcessor.streamBuffer,
      },
    });
    replyID &&
      this.chunkProcessor.streamBuffer.clearMessageBufferByReplyId(replyID);
  };

  private handleHttpChunkReadStreamStart = ({
    localMessageID,
    replyID,
    logID,
  }: MessageLifecycleCallbackParams) => {
    this.reportLogWithScope.info({
      message: '开始拉取回复',
      meta: {
        local_message_id: localMessageID,
        reply_id: replyID || '',
        logID,
      },
    });

    this.chatSdkEventEmit(SdkEventsEnum.MESSAGE_PULLING_STATUS, {
      name: SdkEventsEnum.MESSAGE_PULLING_STATUS,
      data: {
        pullingStatus: 'start',
        local_message_id: localMessageID,
        reply_id: replyID || '',
      },
    });
  };

  private handleHttpChunkTimeout = (
    rawError: MessageLifecycleCallbackParams,
  ) => {
    const { localMessageID, replyID, logID } = rawError;

    const chatCoreError = new ChatCoreError('拉取回复超时', {
      local_message_id: localMessageID,
      reply_id: replyID || '',
      logId: logID,
    });

    this.reportLogWithScope.info({
      message: '拉取回复超时',
      meta: {
        chatCoreError,
      },
    });

    this.chatSdkEventEmit(SdkEventsEnum.MESSAGE_PULLING_STATUS, {
      name: SdkEventsEnum.MESSAGE_PULLING_STATUS,
      data: {
        pullingStatus: 'timeout',
        local_message_id: localMessageID,
        reply_id: replyID || '',
      },
      error: chatCoreError,
      abort: () => {
        this.httpChunk.abort(localMessageID);
      },
    });
  };
}
