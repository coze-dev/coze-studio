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

import { useBotSkillStore } from '../../../src/store/bot-skill';
import {
  saveFetcher,
  updateBotRequest,
} from '../../../src/save-manager/utils/save-fetcher';
import { saveTableMemory } from '../../../src/save-manager/manual-save/memory-table';

// simulated dependency
vi.mock('../../../src/store/bot-skill', () => ({
  useBotSkillStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/save-manager/utils/save-fetcher', () => ({
  saveFetcher: vi.fn(),
  updateBotRequest: vi.fn(),
}));

describe('memory-table save manager', () => {
  const mockDatabaseList = [
    { id: 'db1', name: 'Database 1' },
    { id: 'db2', name: 'Database 2' },
  ];

  const mockTransformVo2Dto = {
    databaseList: vi.fn(databaseList => ({ transformed: databaseList })),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default state
    (useBotSkillStore.getState as any).mockReturnValue({
      databaseList: mockDatabaseList,
      transformVo2Dto: mockTransformVo2Dto,
    });

    (updateBotRequest as any).mockResolvedValue({
      data: { success: true },
    });

    (saveFetcher as any).mockImplementation(async (fn, itemType) => {
      await fn();
      return { success: true };
    });
  });

  it('应该正确保存内存表变量', async () => {
    await saveTableMemory();

    // Verify that transformVo2Dto.DatabaseList is called
    expect(mockTransformVo2Dto.databaseList).toHaveBeenCalledWith(
      mockDatabaseList,
    );

    // Verify that updateBotRequest was called and the parameters are correct
    expect(updateBotRequest).toHaveBeenCalledWith({
      database_list: { transformed: mockDatabaseList },
    });

    // Verify that saveFetcher is called and the parameters are correct
    expect(saveFetcher).toHaveBeenCalledWith(
      expect.any(Function),
      ItemType.TABLE,
    );
  });

  it('应该处理 saveFetcher 抛出的错误', async () => {
    const mockError = new Error('Save failed');
    (saveFetcher as any).mockRejectedValue(mockError);

    await expect(saveTableMemory()).rejects.toThrow(mockError);
  });
});
