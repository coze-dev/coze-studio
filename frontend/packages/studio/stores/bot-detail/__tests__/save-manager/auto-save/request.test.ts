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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItemType } from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { useBotInfoStore } from '../../../src/store/bot-info';
import { saveFetcher } from '../../../src/save-manager/utils/save-fetcher';
import { saveRequest } from '../../../src/save-manager/auto-save/request';

// simulated dependency
vi.mock('@coze-arch/bot-api', () => ({
  PlaygroundApi: {
    UpdateDraftBotInfoAgw: vi.fn(),
  },
}));

vi.mock('../../../src/store/bot-info', () => ({
  useBotInfoStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/utils/storage', () => ({
  storage: {
    baseVersion: 'mock-base-version',
  },
}));

vi.mock('../../../src/save-manager/utils/save-fetcher', () => ({
  saveFetcher: vi.fn(),
}));

describe('auto-save request', () => {
  const mockBotId = 'mock-bot-id';
  const mockPayload = { some_field: 'some_value' };
  const mockItemType = ItemType.TABLE;

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default state
    (useBotInfoStore.getState as any).mockReturnValue({
      botId: mockBotId,
    });

    (PlaygroundApi.UpdateDraftBotInfoAgw as any).mockResolvedValue({
      data: { success: true },
    });

    (saveFetcher as any).mockImplementation(async (fn, itemType) => {
      await fn();
      return { success: true };
    });
  });

  it('应该使用正确的参数调用 saveFetcher', async () => {
    await saveRequest(mockPayload, mockItemType);

    // Verify that saveFetcher is called
    expect(saveFetcher).toHaveBeenCalledTimes(1);
    // Verify that the second argument of saveFetcher is the correct itemType.
    expect(saveFetcher).toHaveBeenCalledWith(
      expect.any(Function),
      mockItemType,
    );

    // Get and execute the first argument (function) of saveFetcher.
    const saveRequestFn = (saveFetcher as any).mock.calls[0][0];
    await saveRequestFn();

    // Verify that UpdateDraftBotInfoAgw is called and the parameters are correct
    expect(PlaygroundApi.UpdateDraftBotInfoAgw).toHaveBeenCalledWith({
      bot_info: {
        bot_id: mockBotId,
        ...mockPayload,
      },
      base_commit_version: 'mock-base-version',
    });
  });

  it('应该处理 saveFetcher 抛出的错误', async () => {
    const mockError = new Error('Save failed');
    (saveFetcher as any).mockRejectedValue(mockError);

    await expect(saveRequest(mockPayload, mockItemType)).rejects.toThrow(
      mockError,
    );
  });
});
