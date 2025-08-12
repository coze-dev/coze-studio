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
import { type UserQueryCollectConf } from '@coze-arch/bot-api/developer_api';

import { useQueryCollectStore } from '../../../src/store/query-collect';
import {
  saveFetcher,
  updateBotRequest,
} from '../../../src/save-manager/utils/save-fetcher';
import { ItemTypeExtra } from '../../../src/save-manager/types';
import { updateQueryCollect } from '../../../src/save-manager/manual-save/query-collect';

// simulated dependency
vi.mock('../../../src/store/query-collect', () => ({
  useQueryCollectStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/save-manager/utils/save-fetcher', () => ({
  saveFetcher: vi.fn(),
  updateBotRequest: vi.fn(),
}));

describe('query-collect save manager', () => {
  const mockQueryCollect = {
    enabled: true,
    config: { maxItems: 10 },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default state
    (useQueryCollectStore.getState as any).mockReturnValue({
      ...mockQueryCollect,
    });

    (updateBotRequest as any).mockResolvedValue({
      data: { success: true },
    });

    (saveFetcher as any).mockImplementation(async (fn, itemType) => {
      await fn();
      return { success: true };
    });
  });

  it('应该正确保存 query collect 配置', async () => {
    // Create an object of UserQueryCollectConf type as a parameter
    const queryCollectConf =
      mockQueryCollect as unknown as UserQueryCollectConf;

    await updateQueryCollect(queryCollectConf);

    // Verify that updateBotRequest was called and the parameters are correct
    expect(updateBotRequest).toHaveBeenCalledWith({
      user_query_collect_conf: queryCollectConf,
    });

    // Verify that saveFetcher is called and the parameters are correct
    expect(saveFetcher).toHaveBeenCalledWith(
      expect.any(Function),
      ItemTypeExtra.QueryCollect,
    );
  });

  it('应该处理 saveFetcher 抛出的错误', async () => {
    const mockError = new Error('Save failed');
    (saveFetcher as any).mockRejectedValue(mockError);

    // Create an object of UserQueryCollectConf type as a parameter
    const queryCollectConf =
      mockQueryCollect as unknown as UserQueryCollectConf;

    await expect(updateQueryCollect(queryCollectConf)).rejects.toThrow(
      mockError,
    );
  });
});
