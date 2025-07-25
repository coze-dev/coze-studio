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
import { saveTimeCapsule } from '../../../src/save-manager/manual-save/time-capsule';

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

describe('time-capsule save manager', () => {
  const mockTimeCapsule = {
    time_capsule_mode: 'enabled',
    disable_prompt_calling: false,
  };

  const mockTransformedTimeCapsule = {
    enabled: true,
    tags: ['tag1', 'tag2'],
  };

  const mockTransformVo2Dto = {
    timeCapsule: vi.fn(() => mockTransformedTimeCapsule),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认状态
    (useBotSkillStore.getState as any).mockReturnValue({
      timeCapsule: mockTimeCapsule,
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

  it('应该正确保存 time capsule 配置', async () => {
    await saveTimeCapsule();

    // 验证 transformVo2Dto.timeCapsule 被调用，参数应该是包含 time_capsule_mode 和 disable_prompt_calling 的对象
    expect(mockTransformVo2Dto.timeCapsule).toHaveBeenCalledWith({
      time_capsule_mode: mockTimeCapsule.time_capsule_mode,
      disable_prompt_calling: mockTimeCapsule.disable_prompt_calling,
    });
    // 验证 updateBotRequest 被调用，并且参数正确
    expect(updateBotRequest).toHaveBeenCalledWith({
      bot_tag_info: mockTransformedTimeCapsule,
    });

    //  验证 saveFetcher 被调用，并且参数正确
    expect(saveFetcher).toHaveBeenCalledWith(
      expect.any(Function),
      ItemTypeExtra.TimeCapsule,
    );
  });

  it('应该处理 saveFetcher 抛出的错误', async () => {
    const mockError = new Error('Save failed');
    (saveFetcher as any).mockRejectedValue(mockError);

    await expect(saveTimeCapsule()).rejects.toThrow(mockError);
  });
});
