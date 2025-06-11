import { describe, it, expect, vi } from 'vitest';
import { PromptType } from '@coze-arch/bot-api/developer_api';

import { getReplacedBotPrompt } from '../../src/utils/save';
import { usePersonaStore } from '../../src/store/persona';

// 模拟 usePersonaStore
vi.mock('../../src/store/persona', () => ({
  usePersonaStore: {
    getState: vi.fn().mockReturnValue({
      systemMessage: {
        data: '模拟的系统消息',
      },
    }),
  },
}));

describe('save utils', () => {
  describe('getReplacedBotPrompt', () => {
    it('应该返回包含系统消息的提示数组', () => {
      const result = getReplacedBotPrompt();

      expect(result).toHaveLength(3);

      // 验证系统消息
      expect(result[0]).toEqual({
        prompt_type: PromptType.SYSTEM,
        data: '模拟的系统消息',
      });

      // 验证用户前缀
      expect(result[1]).toEqual({
        prompt_type: PromptType.USERPREFIX,
        data: '',
      });

      // 验证用户后缀
      expect(result[2]).toEqual({
        prompt_type: PromptType.USERSUFFIX,
        data: '',
      });
    });

    it('应该从 usePersonaStore 获取系统消息', () => {
      getReplacedBotPrompt();

      expect(usePersonaStore.getState).toHaveBeenCalled();
    });
  });
});
