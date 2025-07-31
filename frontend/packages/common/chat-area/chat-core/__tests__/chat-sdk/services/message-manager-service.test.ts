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

import { MessageManagerService } from '@/chat-sdk/services/message-manager-service';

describe('MessageManagerService', () => {
  let messageManagerService;
  let messageManagerMock;
  let chunkProcessorMock;
  let httpChunkMock;
  let reportEventsTracerMock;
  let reportLogWithScopeMock;

  beforeEach(() => {
    messageManagerMock = {
      getHistoryMessage: vi.fn(),
      clearMessageContextUrl: vi.fn(),
      clearHistory: vi.fn(),
      deleteMessage: vi.fn(),
      reportMessage: vi.fn(),
      breakMessage: vi.fn(),
    };
    chunkProcessorMock = {
      getReplyMessagesLengthByReplyId: vi.fn(),
    };
    httpChunkMock = {
      abort: vi.fn(),
    };
    reportEventsTracerMock = {
      pullStreamTracer: {
        break: vi.fn(),
      },
    };
    reportLogWithScopeMock = {
      slardarEvent: vi.fn(),
    };

    messageManagerService = new MessageManagerService({
      messageManager: messageManagerMock,
      conversation_id: 'conversation-id',
      scene: 'scene',
      bot_id: 'bot-id',
      preset_bot: 'preset-bot',
      draft_mode: false,
      httpChunk: httpChunkMock,
      chunkProcessor: chunkProcessorMock,
      reportEventsTracer: reportEventsTracerMock,
      reportLogWithScope: reportLogWithScopeMock,
    });
  });

  it('retrieves and returns historical messages', async () => {
    messageManagerMock.getHistoryMessage.mockResolvedValue({
      message_list: [{ message_id: '1', content: 'Hello' }],
    });

    const result = await messageManagerService.getHistoryMessage({});
    expect(result.message_list).toHaveLength(1);
    expect(result.message_list[0].content).toBe('Hello');
  });

  it('clears message context and returns response', async () => {
    messageManagerMock.clearMessageContextUrl.mockResolvedValue({
      success: true,
    });

    const result = await messageManagerService.clearMessageContext({});
    expect(result.success).toBe(true);
  });

  it('clears conversation history', async () => {
    messageManagerMock.clearHistory.mockResolvedValue({ success: true });

    const result = await messageManagerService.clearHistory();
    expect(result.success).toBe(true);
  });

  it('deletes a message and returns response', async () => {
    messageManagerMock.deleteMessage.mockResolvedValue({ success: true });

    const result = await messageManagerService.deleteMessage({});
    expect(result.success).toBe(true);
  });

  it('reports a message and returns response', async () => {
    messageManagerMock.reportMessage.mockResolvedValue({ success: true });

    const result = await messageManagerService.reportMessage({});
    expect(result.success).toBe(true);
  });

  it('breaks a message and logs event', async () => {
    messageManagerMock.breakMessage.mockResolvedValue({ success: true });
    chunkProcessorMock.getReplyMessagesLengthByReplyId.mockReturnValue(10);

    const result = await messageManagerService.breakMessage({
      local_message_id: 'local-id',
      query_message_id: 'query-id',
    });

    expect(httpChunkMock.abort).toBeCalledWith('local-id');
    expect(reportEventsTracerMock.pullStreamTracer.break).toBeCalledWith(
      'local-id',
      { contentLength: 10 },
    );
    expect(reportLogWithScopeMock.slardarEvent).toBeCalledWith({
      eventName: 'chat_sdk_break_message',
      meta: {
        local_message_id: 'local-id',
        query_message_id: 'query-id',
      },
    });
    expect(result.success).toBe(true);
  });
});
