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

import { useBotSkillStore } from '../../../src/store/bot-skill';
import {
  saveFetcher,
  updateBotRequest,
} from '../../../src/save-manager/utils/save-fetcher';
import { ItemTypeExtra } from '../../../src/save-manager/types';
import { updateShortcutSort } from '../../../src/save-manager/manual-save/shortcuts';

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

describe('shortcuts save manager', () => {
  const mockShortcut = ['shortcut-1', 'shortcut-2'];

  const mockTransformVo2Dto = {
    shortcut: vi.fn(shortcut => shortcut),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default state
    (useBotSkillStore.getState as any).mockReturnValue({
      shortcut: mockShortcut,
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

  it('应该正确保存 shortcuts 排序', async () => {
    const newSort = ['shortcut-2', 'shortcut-1'];
    await updateShortcutSort(newSort);

    // Verify that updateBotRequest was called and the parameters are correct
    expect(updateBotRequest).toHaveBeenCalledWith({
      shortcut_sort: newSort,
    });

    // Verify that saveFetcher is called and the parameters are correct
    expect(saveFetcher).toHaveBeenCalledWith(
      expect.any(Function),
      ItemTypeExtra.Shortcut,
    );
  });

  it('应该处理 saveFetcher 抛出的错误', async () => {
    const mockError = new Error('Save failed');
    (saveFetcher as any).mockRejectedValue(mockError);

    const newSort = ['shortcut-2', 'shortcut-1'];

    await expect(updateShortcutSort(newSort)).rejects.toThrow(mockError);
  });
});
