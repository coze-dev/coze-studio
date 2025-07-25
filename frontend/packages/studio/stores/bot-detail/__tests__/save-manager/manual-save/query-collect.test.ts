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

// 模拟依赖
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

    // 设置默认状态
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
    // 创建一个符合 UserQueryCollectConf 类型的对象作为参数
    const queryCollectConf =
      mockQueryCollect as unknown as UserQueryCollectConf;

    await updateQueryCollect(queryCollectConf);

    // 验证 updateBotRequest 被调用，并且参数正确
    expect(updateBotRequest).toHaveBeenCalledWith({
      user_query_collect_conf: queryCollectConf,
    });

    // 验证 saveFetcher 被调用，并且参数正确
    expect(saveFetcher).toHaveBeenCalledWith(
      expect.any(Function),
      ItemTypeExtra.QueryCollect,
    );
  });

  it('应该处理 saveFetcher 抛出的错误', async () => {
    const mockError = new Error('Save failed');
    (saveFetcher as any).mockRejectedValue(mockError);

    // 创建一个符合 UserQueryCollectConf 类型的对象作为参数
    const queryCollectConf =
      mockQueryCollect as unknown as UserQueryCollectConf;

    await expect(updateQueryCollect(queryCollectConf)).rejects.toThrow(
      mockError,
    );
  });
});
