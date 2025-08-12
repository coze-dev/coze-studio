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

import { vi } from 'vitest';

import { PreSendLocalMessageEventsEnum } from '@/message/types';
import { ChatCoreError } from '@/custom-error';
import { SdkEventsEnum } from '@/chat-sdk/types/interface';
import {
  HttpChunkService,
  type HttpChunkServiceProps,
} from '@/chat-sdk/services/http-chunk-service';

describe('HttpChunkService', () => {
  let httpChunkService: HttpChunkService;
  let mockHttpChunk: any;
  let mockReportLog: any;
  let mockChunkProcessor: any;
  let mockPreSendLocalMessageEventsManager: any;
  let mockChatSdkEventEmit: any;
  let mockChatSdkEventBus: any;
  let mockReportEventsTracer: any;

  beforeEach(() => {
    mockHttpChunk = { on: vi.fn(), abort: vi.fn() };
    mockReportLog = { info: vi.fn() };
    mockChunkProcessor = {
      getAckMessageByChunk: vi.fn(),
      isMessageAnswerEnd: vi.fn(),
      isFirstReplyMessage: vi.fn(),
      addChunkAndProcess: vi.fn(),
      getProcessedMessageByChunk: vi.fn(),
      getReplyMessagesLengthByReplyId: vi.fn(),
      streamBuffer: { clearMessageBufferByReplyId: vi.fn() },
      getAckMessageByLocalMessageId: vi.fn(),
    };
    mockPreSendLocalMessageEventsManager = { emit: vi.fn() };
    mockChatSdkEventEmit = vi.fn();
    mockChatSdkEventBus = { eventNames: vi.fn().mockReturnValue([]) };
    mockReportEventsTracer = {
      pullStreamTracer: {
        start: vi.fn(),
        receiveFirstAnsChunk: vi.fn(),
        error: vi.fn(),
        success: vi.fn(),
        receiveAck: vi.fn(),
      },
    };

    const props: HttpChunkServiceProps = {
      httpChunk: mockHttpChunk,
      reportLogWithScope: mockReportLog,
      chunkProcessor: mockChunkProcessor,
      preSendLocalMessageEventsManager: mockPreSendLocalMessageEventsManager,
      chatSdkEventEmit: mockChatSdkEventEmit,
      chatSdkEventBus: mockChatSdkEventBus,
      reportEventsTracer: mockReportEventsTracer,
    };

    httpChunkService = new HttpChunkService(props);
  });

  it('handles FETCH_START event correctly', () => {
    const localMessageID = 'local-message-id';
    httpChunkService.handleHttpChunkFetchStart({ localMessageID });
    expect(mockReportEventsTracer.pullStreamTracer.start).toHaveBeenCalledWith(
      localMessageID,
    );
  });

  it('handles MESSAGE_RECEIVED event and emits MESSAGE_RECEIVED_AND_UPDATE for non-ack message', () => {
    const receiveMessage = {
      chunk: {
        message: { type: 'text', extra_info: { local_message_id: 'local_id' } },
      },
      logID: 'log-id',
    };
    const processedMessage = { message: 'processed' };
    mockChunkProcessor.getProcessedMessageByChunk.mockReturnValue(
      processedMessage,
    );

    httpChunkService.handleHttpChunkMessageReceived(receiveMessage);

    expect(mockChunkProcessor.addChunkAndProcess).toHaveBeenCalledWith(
      receiveMessage.chunk,
      { logId: receiveMessage.logID },
    );
    expect(mockChatSdkEventEmit).toHaveBeenCalledWith(
      SdkEventsEnum.MESSAGE_RECEIVED_AND_UPDATE,
      {
        name: SdkEventsEnum.MESSAGE_RECEIVED_AND_UPDATE,
        data: [processedMessage],
      },
    );
  });

  it('handles MESSAGE_RECEIVED event and emits MESSAGE_SEND_SUCCESS for ack message', () => {
    const receiveMessage = {
      chunk: { message: { type: 'ack' } },
      logID: 'log-id',
    };
    const processedMessage = {
      message: 'processed',
      extra_info: { local_message_id: 'local-message-id' },
    };
    mockChunkProcessor.getProcessedMessageByChunk.mockReturnValue(
      processedMessage,
    );

    mockChunkProcessor.getAckMessageByChunk.mockReturnValue(processedMessage);

    httpChunkService.handleHttpChunkMessageReceived(receiveMessage);

    expect(mockPreSendLocalMessageEventsManager.emit).toHaveBeenCalledWith(
      PreSendLocalMessageEventsEnum.MESSAGE_SEND_SUCCESS,
      processedMessage,
    );
    expect(
      mockReportEventsTracer.pullStreamTracer.receiveAck,
    ).toHaveBeenCalledWith('local-message-id', { logId: 'log-id' });
  });

  it('handles FETCH_ERROR event and emits MESSAGE_SEND_FAIL', () => {
    const errorInfo = {
      ext: {
        localMessageID: 'local-message-id',
        replyID: 'reply-id',
        logID: 'log-id',
      },
      code: '500',
      msg: 'Fetch error',
    };

    httpChunkService.handleHttpChunkFetchError(errorInfo);

    const chatCoreError = new ChatCoreError('Fetch error', {
      code: '500',
      local_message_id: 'local-message-id',
      logId: 'log-id',
      reply_id: 'reply-id',
      rawError: errorInfo,
    });

    expect(mockPreSendLocalMessageEventsManager.emit.mock.calls[0][0]).toBe(
      PreSendLocalMessageEventsEnum.MESSAGE_SEND_FAIL,
    );

    expect(
      mockPreSendLocalMessageEventsManager.emit.mock.calls[0][1].flatten(),
    ).toEqual(chatCoreError.flatten());
  });

  it('handles READ_STREAM_ERROR event and emits MESSAGE_SEND_FAIL when no ack message is found', () => {
    const errorInfo = {
      ext: {
        localMessageID: 'local-message-id',
        replyID: 'reply-id',
        logID: 'log-id',
      },
      code: '500',
      msg: 'Read stream error',
    };
    mockChunkProcessor.getAckMessageByLocalMessageId.mockReturnValue(undefined);

    httpChunkService.handleReadStreamError(errorInfo);

    const chatCoreError = new ChatCoreError('Read stream error', {
      code: '500',
      local_message_id: 'local-message-id',
      logId: 'log-id',
      reply_id: 'reply-id',
      rawError: errorInfo,
    });

    expect(mockPreSendLocalMessageEventsManager.emit.mock.calls[0][0]).toBe(
      PreSendLocalMessageEventsEnum.MESSAGE_SEND_FAIL,
    );

    expect(
      mockPreSendLocalMessageEventsManager.emit.mock.calls[0][1].flatten(),
    ).toEqual(chatCoreError.flatten());
  });

  it('handles READ_STREAM_ERROR event and emits MESSAGE_PULLING_STATUS with error when ack message is found', () => {
    const errorInfo = {
      ext: {
        localMessageID: 'local-message-id',
        replyID: 'reply-id',
        logID: 'log-id',
      },
      code: '500',
      msg: 'Read stream error',
    };
    mockChunkProcessor.getAckMessageByLocalMessageId.mockReturnValue({});

    httpChunkService.handleReadStreamError(errorInfo);

    const chatCoreError = new ChatCoreError('Read stream error', {
      code: '500',
      local_message_id: 'local-message-id',
      logId: 'log-id',
      reply_id: 'reply-id',
      rawError: errorInfo,
    });

    expect(mockChatSdkEventEmit.mock.calls[0][0]).toBe(
      SdkEventsEnum.MESSAGE_PULLING_STATUS,
    );

    expect(mockChatSdkEventEmit.mock.calls[0][1]).toMatchObject({
      name: SdkEventsEnum.MESSAGE_PULLING_STATUS,
      data: {
        pullingStatus: 'error',
        local_message_id: 'local-message-id',
        reply_id: 'reply-id',
      },
      // error: chatCoreError,
    });

    expect(mockChatSdkEventEmit.mock.calls[0][1].error.flatten()).toEqual(
      chatCoreError.flatten(),
    );
  });

  it('handles ALL_SUCCESS event and clears message buffer', () => {
    const localMessageID = 'local-message-id';
    const replyID = 'reply-id';

    httpChunkService.handleHttpChunkStreamSuccess({
      localMessageID,
      replyID,
    });

    expect(mockReportLog.info).toHaveBeenCalledWith({
      message: '拉取回复完成',
      meta: {
        local_message_id: localMessageID,
        reply_id: replyID,
        streamBuffer: mockChunkProcessor.streamBuffer,
      },
    });
    expect(
      mockChunkProcessor.streamBuffer.clearMessageBufferByReplyId,
    ).toHaveBeenCalledWith(replyID);
  });

  it('handles BETWEEN_CHUNK_TIMEOUT event and calls abort', () => {
    const rawError = {
      localMessageID: 'local-message-id',
      replyID: 'reply-id',
      logID: 'log-id',
    };
    const chatCoreError = new ChatCoreError('拉取回复超时', {
      local_message_id: 'local-message-id',
      logId: 'log-id',
      reply_id: 'reply-id',
    });

    httpChunkService.handleHttpChunkTimeout(rawError);

    expect(mockChatSdkEventEmit.mock.calls[0][0]).toBe(
      SdkEventsEnum.MESSAGE_PULLING_STATUS,
    );

    expect(mockChatSdkEventEmit.mock.calls[0][1]).toMatchObject({
      name: SdkEventsEnum.MESSAGE_PULLING_STATUS,
      data: {
        pullingStatus: 'timeout',
        local_message_id: 'local-message-id',
        reply_id: 'reply-id',
      },
      // error: chatCoreError,
      abort: expect.any(Function),
    });

    expect(mockChatSdkEventEmit.mock.calls[0][1].error.flatten()).toEqual(
      chatCoreError.flatten(),
    );
  });
});
