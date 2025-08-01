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

import { type ReportLog } from '@/report-log';
import {
  ContentType,
  type Message,
  PreSendLocalMessageEventsEnum,
  type SendMessageOptions,
} from '@/message/types';
import { PreSendLocalMessageEventsManager } from '@/message/presend-local-message/presend-local-message-events-manager';
import { PreSendLocalMessageFactory } from '@/message';
import { Scene } from '@/chat-sdk/types/interface';
import { SendMessageService } from '@/chat-sdk/services/send-message-service';
import { type ReportEventsTracer } from '@/chat-sdk/events/slardar-events';
import { type HttpChunk } from '@/channel/http-chunk';

describe('SendMessageService', () => {
  let sendMessageService: SendMessageService;
  let preSendLocalMessageEventsManager: PreSendLocalMessageEventsManager;
  let preSendLocalMessageFactory: PreSendLocalMessageFactory;
  let httpChunk: HttpChunk;
  let reportLogWithScope: ReportLog;
  let reportEventsTracer: ReportEventsTracer;

  beforeEach(() => {
    preSendLocalMessageFactory = new PreSendLocalMessageFactory({
      bot_id: 'bot_id_123',
      conversation_id: 'converstaion_id_12341',
      user: 'user_123',
      scene: Scene.Playground,
      draft_mode: true,
    });
    preSendLocalMessageEventsManager = new PreSendLocalMessageEventsManager({
      reportLog: {
        createLoggerWith: vi.fn().mockReturnValue({
          info: vi.fn(),
        }),
      },
    });
    httpChunk = {
      sendMessage: vi.fn().mockResolvedValue({}),
    } as unknown as HttpChunk;
    reportLogWithScope = {
      info: vi.fn(),
      slardarEvent: vi.fn(),
    } as unknown as ReportLog;
    reportEventsTracer = {
      sendMessageTracer: {
        start: vi.fn(),
        success: vi.fn(),
        timeout: vi.fn(),
      },
    } as unknown as ReportEventsTracer;

    sendMessageService = new SendMessageService({
      preSendLocalMessageFactory,
      preSendLocalMessageEventsManager,
      httpChunk,
      reportLogWithScope,
      reportEventsTracer,
    });
  });

  it('should send a text message successfully', async () => {
    const message: Message<ContentType.Text> = {
      content_type: ContentType.Text,
      extra_info: { local_message_id: '123' },
    };
    const options: SendMessageOptions = {};

    setTimeout(() => {
      preSendLocalMessageEventsManager.emit(
        PreSendLocalMessageEventsEnum.MESSAGE_SEND_SUCCESS,
        {
          content_type: ContentType.Text,
          extra_info: {
            local_message_id: '123',
          },
        },
      );
    }, 1000);
    const result = await sendMessageService.sendMessage(message, options);

    expect(result).toBeDefined();
    expect(result.content_type).toBe(ContentType.Text);
    expect(result.extra_info.local_message_id).toBe('123');
  });

  it('should send an image message successfully', async () => {
    const message: Message<ContentType.Image> = {
      content_type: ContentType.Image,
      extra_info: { local_message_id: '456' },
    };
    const options: SendMessageOptions = {};
    // Upload successful after 1s
    setTimeout(() => {
      preSendLocalMessageEventsManager.emit(
        PreSendLocalMessageEventsEnum.FILE_UPLOAD_STATUS_CHANGE,
        {
          content_type: ContentType.Image,
          file_upload_result: 'success',
          extra_info: {
            local_message_id: '456',
          },
        },
      );
    }, 1000);
    // Sent successfully after 2s
    setTimeout(() => {
      preSendLocalMessageEventsManager.emit(
        PreSendLocalMessageEventsEnum.MESSAGE_SEND_SUCCESS,
        {
          content_type: ContentType.Image,
          extra_info: {
            local_message_id: '456',
          },
        },
      );
    }, 2000);
    const result = await sendMessageService.sendMessage(message, options);

    expect(result).toBeDefined();
    expect(result.content_type).toBe(ContentType.Image);
    expect(result.extra_info.local_message_id).toBe('456');
  });

  it('should send a file message successfully', async () => {
    const message: Message<ContentType.File> = {
      content_type: ContentType.File,
      extra_info: { local_message_id: '789' },
    };
    const options: SendMessageOptions = {};
    // Upload successful after 1s
    setTimeout(() => {
      preSendLocalMessageEventsManager.emit(
        PreSendLocalMessageEventsEnum.FILE_UPLOAD_STATUS_CHANGE,
        {
          content_type: ContentType.File,
          file_upload_result: 'success',
          extra_info: {
            local_message_id: '789',
          },
        },
      );
    }, 1000);
    setTimeout(() => {
      preSendLocalMessageEventsManager.emit(
        PreSendLocalMessageEventsEnum.MESSAGE_SEND_SUCCESS,
        {
          content_type: ContentType.File,
          extra_info: {
            local_message_id: '789',
          },
        },
      );
    }, 1000);
    const result = await sendMessageService.sendMessage(message, options);

    expect(result).toBeDefined();
    expect(result.content_type).toBe(ContentType.File);
    expect(result.extra_info.local_message_id).toBe('789');
  });

  it('should handle send timeout properly', async () => {
    const message: Message<ContentType.Text> = {
      content_type: ContentType.Text,
      extra_info: { local_message_id: '123' },
    };
    const options: SendMessageOptions = { sendTimeout: 100 };

    await expect(
      sendMessageService.sendMessage(message, options),
    ).rejects.toThrow();
  });

  it('should handle image upload failure', async () => {
    const message: Message<ContentType.Image> = {
      content_type: ContentType.Image,
      extra_info: { local_message_id: '456' },
    };
    const options: SendMessageOptions = {};

    vi.spyOn(
      preSendLocalMessageEventsManager,
      'getStashedLocalMessage',
    ).mockReturnValueOnce({
      file_upload_result: 'failure',
    });

    await expect(
      sendMessageService.sendMessage(message, options),
    ).rejects.toThrowError('图片上传失败');
  });
});
