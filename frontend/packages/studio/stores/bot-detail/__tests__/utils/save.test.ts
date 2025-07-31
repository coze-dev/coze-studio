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

import { describe, it, expect, vi } from 'vitest';
import { PromptType } from '@coze-arch/bot-api/developer_api';

import { getReplacedBotPrompt } from '../../src/utils/save';
import { usePersonaStore } from '../../src/store/persona';

// emulation usePersonaStore
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

      // Verify system message
      expect(result[0]).toEqual({
        prompt_type: PromptType.SYSTEM,
        data: '模拟的系统消息',
      });

      // validate user prefix
      expect(result[1]).toEqual({
        prompt_type: PromptType.USERPREFIX,
        data: '',
      });

      // validate user suffix
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
