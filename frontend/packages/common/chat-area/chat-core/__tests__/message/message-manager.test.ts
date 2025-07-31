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

import { MessageManager } from '@/message/message-manager';

describe('MessageManager', () => {
  let messageManager;
  let requestManagerMock;
  let reportLogMock;

  beforeEach(() => {
    requestManagerMock = {
      request: {
        post: vi.fn(),
      },
      getSceneConfig: vi.fn().mockReturnValue({ url: 'http://example.com' }),
    };
    reportLogMock = {
      createLoggerWith: vi.fn().mockReturnValue({
        slardarErrorEvent: vi.fn(),
      }),
    };
    messageManager = new MessageManager({
      reportLog: reportLogMock,
      requestManager: requestManagerMock,
    });
  });

  it('returns converted message list when getHistoryMessage is called', async () => {
    requestManagerMock.request.post.mockResolvedValue({
      data: {
        message_list: [
          { message_id: '1', content_type: 'text', content: 'Hello' },
          {
            message_id: '2',
            content_type: 'json',
            content: '{"key": "value"}',
          },
        ],
      },
    });

    const result = await messageManager.getHistoryMessage({});

    expect(result.message_list[0].content_obj).toBeUndefined();
    expect(result.message_list[1].content_obj).toEqual({ key: 'value' });
  });

  it('throws an error and reports it when getHistoryMessage fails', async () => {
    const error = new Error('Network Error');
    requestManagerMock.request.post.mockRejectedValue(error);

    await expect(messageManager.getHistoryMessage({})).rejects.toThrow(error);
    expect(reportLogMock.createLoggerWith().slardarErrorEvent).toBeCalledWith({
      eventName: 'message_fetch_history_error',
      error,
    });
  });

  it('clears message context and returns response data', async () => {
    requestManagerMock.request.post.mockResolvedValue({
      data: { success: true },
    });

    const result = await messageManager.clearMessageContextUrl({});
    expect(result.success).toBe(true);
  });

  it('reports error and does not throw when clearMessageContextUrl fails', async () => {
    const error = new Error('Network Error');
    requestManagerMock.request.post.mockRejectedValue(error);

    const result = await messageManager.clearMessageContextUrl({});
    expect(result).toBeUndefined();
    expect(reportLogMock.createLoggerWith().slardarErrorEvent).toBeCalledWith({
      eventName: 'message_clear_context_error',
      error,
    });
  });

  it('deletes a message and returns response data', async () => {
    requestManagerMock.request.post.mockResolvedValue({
      data: { success: true },
    });

    const result = await messageManager.deleteMessage({});
    expect(result.success).toBe(true);
  });

  it('reports error and does not throw when deleteMessage fails', async () => {
    const error = new Error('Network Error');
    requestManagerMock.request.post.mockRejectedValue(error);

    const result = await messageManager.deleteMessage({});
    expect(result).toBeUndefined();
    expect(reportLogMock.createLoggerWith().slardarErrorEvent).toBeCalledWith({
      eventName: 'message_delete_error',
      error,
    });
  });
});
