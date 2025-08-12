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

import { RequestScene } from '@/request-manager/types';
import { RequestManager } from '@/request-manager';

vi.mock('./request-config');

describe('RequestManager', () => {
  let requestManager: RequestManager;
  let reportLogMock: any;

  beforeEach(() => {
    reportLogMock = {
      createLoggerWith: vi.fn().mockReturnThis(),
      info: vi.fn(),
    };
    requestManager = new RequestManager({ reportLog: reportLogMock });
  });

  it('initializes with merged options', () => {
    expect(reportLogMock.createLoggerWith).toBeCalledWith({
      scope: 'RequestManager',
    });
    expect(requestManager.request).toBeDefined();
  });

  it('appends new options correctly', () => {
    const newOptions = { timeout: 5000 };
    requestManager.appendRequestOptions(newOptions);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(requestManager.mergedBaseOptions).toMatchObject({
      timeout: 5000,
    });
  });

  it('calls onBeforeRequest hooks in the correct order', async () => {
    const beforeRequestHook1 = vi.fn().mockResolvedValue({});
    const beforeRequestHook2 = vi.fn().mockResolvedValue({});
    requestManager.mergedBaseOptions.hooks = {
      onBeforeRequest: [beforeRequestHook1, beforeRequestHook2],
    };

    await requestManager.request.interceptors.request.handlers[0].fulfilled({});
    expect(beforeRequestHook1).toHaveBeenCalled();
    expect(beforeRequestHook2).toHaveBeenCalled();
    expect(beforeRequestHook1.mock.invocationCallOrder[0]).toBeLessThan(
      beforeRequestHook2.mock.invocationCallOrder[0],
    );
  });

  it('handles onAfterResponse hooks in the correct order', async () => {
    const afterResponseHook1 = vi.fn().mockResolvedValue({
      config: {
        url: '/api/conversation/resume_chat',
      },
    });
    const afterResponseHook2 = vi.fn().mockResolvedValue({
      config: {
        url: '/api/conversation/get_message_list',
      },
    });
    requestManager.mergedBaseOptions.hooks = {
      onAfterResponse: [afterResponseHook1, afterResponseHook2],
    };

    await requestManager.request.interceptors.response.handlers[0].fulfilled({
      config: {},
    });
    expect(afterResponseHook1).toHaveBeenCalled();
    expect(afterResponseHook2).toHaveBeenCalled();
    expect(afterResponseHook1.mock.invocationCallOrder[0]).toBeLessThan(
      afterResponseHook2.mock.invocationCallOrder[0],
    );
  });

  it('fetches the correct scene config', () => {
    const sceneConfig = requestManager.getSceneConfig(RequestScene.SendMessage);
    expect(sceneConfig).toMatchObject({
      url: '/api/conversation/chat',
    });
  });
});
