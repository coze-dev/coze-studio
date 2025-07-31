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
import { type HookInfo } from '@coze-arch/idl/playground_api';
import { ItemType } from '@coze-arch/bot-api/developer_api';

import { useBotSkillStore } from '../../../src/store/bot-skill';
import {
  saveFetcher,
  updateBotRequest,
} from '../../../src/save-manager/utils/save-fetcher';
import { saveDevHooksConfig } from '../../../src/save-manager/manual-save/dev-hooks';

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

describe('dev-hooks save manager', () => {
  const mockDevHooks = {
    hooks: [{ id: 'hook-1', name: 'Test Hook', enabled: true }],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default state
    (useBotSkillStore.getState as any).mockReturnValue({
      devHooks: mockDevHooks,
    });

    (updateBotRequest as any).mockResolvedValue({
      data: { success: true },
    });

    (saveFetcher as any).mockImplementation(async (fn, itemType) => {
      await fn();
      return { success: true };
    });
  });

  it('应该正确保存 dev hooks 配置', async () => {
    const newConfig = {
      hooks: [{ id: 'hook-1', name: 'Updated Hook', enabled: false }],
    } as any as HookInfo;
    await saveDevHooksConfig(newConfig);

    // Verify that updateBotRequest was called and the parameters are correct
    expect(updateBotRequest).toHaveBeenCalledWith({
      hook_info: newConfig,
    });

    // Verify that saveFetcher is called and the parameters are correct
    expect(saveFetcher).toHaveBeenCalledWith(
      expect.any(Function),
      ItemType.HOOKINFO,
    );
  });

  it('应该处理 saveFetcher 抛出的错误', async () => {
    const mockError = new Error('Save failed');
    (saveFetcher as any).mockRejectedValue(mockError);

    const newConfig = {
      hooks: [{ id: 'hook-1', name: 'Updated Hook', enabled: false }],
    } as any as HookInfo;

    await expect(saveDevHooksConfig(newConfig)).rejects.toThrow(mockError);
  });
});
