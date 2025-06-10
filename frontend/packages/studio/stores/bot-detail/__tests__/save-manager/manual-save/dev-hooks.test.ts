import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type HookInfo } from '@coze-arch/idl/playground_api';
import { ItemType } from '@coze-arch/bot-api/developer_api';

import { useBotSkillStore } from '../../../src/store/bot-skill';
import {
  saveFetcher,
  updateBotRequest,
} from '../../../src/save-manager/utils/save-fetcher';
import { saveDevHooksConfig } from '../../../src/save-manager/manual-save/dev-hooks';

// 模拟依赖
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

    // 设置默认状态
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

    // 验证 updateBotRequest 被调用，并且参数正确
    expect(updateBotRequest).toHaveBeenCalledWith({
      hook_info: newConfig,
    });

    // 验证 saveFetcher 被调用，并且参数正确
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
