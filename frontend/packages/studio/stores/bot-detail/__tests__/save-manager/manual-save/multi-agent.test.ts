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
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { useMultiAgentStore } from '../../../src/store/multi-agent';
import { useBotInfoStore } from '../../../src/store/bot-info';
import { saveFetcher } from '../../../src/save-manager/utils/save-fetcher';
import { ItemTypeExtra } from '../../../src/save-manager/types';
import {
  saveUpdateAgents,
  saveDeleteAgents,
  saveMultiAgentData,
  saveConnectorType,
} from '../../../src/save-manager/manual-save/multi-agent';

// 模拟依赖
vi.mock('@coze-arch/bot-api', () => ({
  PlaygroundApi: {
    UpdateAgentV2: vi.fn(),
    UpdateMultiAgent: vi.fn(),
  },
}));

vi.mock('@coze-arch/bot-studio-store', () => ({
  useSpaceStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/store/multi-agent', () => ({
  useMultiAgentStore: {
    getState: vi.fn(),
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

describe('multi-agent save manager', () => {
  const mockBotId = 'mock-bot-id';
  const mockSpaceId = 'mock-space-id';
  // 创建一个符合 Agent 类型的模拟对象
  const mockAgent = {
    id: 'agent-1',
    name: 'Agent 1',
    description: 'Test agent',
    prompt: 'Test prompt',
    model: { model_name: 'gpt-4' },
    skills: {
      knowledge: [],
      pluginApis: [],
      workflows: [],
      devHooks: {},
    },
    system_info_all: [],
    bizInfo: { id: 'biz-1' },
    jump_config: { enabled: false },
    suggestion: { enabled: false },
  };
  const mockAgentDto = {
    id: 'agent-1',
    name: 'Agent 1',
    description: 'Test agent',
    type: 'agent',
  };
  const mockChatModeConfig = {
    type: 'sequential',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认状态
    (useBotInfoStore.getState as any).mockReturnValue({
      botId: mockBotId,
    });

    (useSpaceStore.getState as any).mockReturnValue({
      getSpaceId: vi.fn(() => mockSpaceId),
    });

    (useMultiAgentStore.getState as any).mockReturnValue({
      chatModeConfig: mockChatModeConfig,
      transformVo2Dto: {
        agent: vi.fn(() => mockAgentDto),
      },
    });

    (PlaygroundApi.UpdateAgentV2 as any).mockResolvedValue({
      data: { success: true },
    });

    (PlaygroundApi.UpdateMultiAgent as any).mockResolvedValue({
      data: { success: true },
    });

    (saveFetcher as any).mockImplementation(async (fn, itemType) => {
      await fn();
      return { success: true };
    });
  });

  describe('saveUpdateAgents', () => {
    it('应该正确更新代理', async () => {
      await saveUpdateAgents(mockAgent as any);

      // 验证 transformVo2Dto.agent 被调用
      expect(
        useMultiAgentStore.getState().transformVo2Dto.agent,
      ).toHaveBeenCalledWith(mockAgent);

      // 验证 saveFetcher 被调用，并且参数正确
      expect(saveFetcher).toHaveBeenCalledWith(
        expect.any(Function),
        ItemTypeExtra.MultiAgent,
      );

      // 获取并执行 saveFetcher 的第一个参数（函数）
      const saveRequestFn = (saveFetcher as any).mock.calls[0][0];
      await saveRequestFn();

      // 验证 UpdateAgentV2 被调用，并且参数正确
      expect(PlaygroundApi.UpdateAgentV2).toHaveBeenCalledWith({
        ...mockAgentDto,
        bot_id: mockBotId,
        space_id: mockSpaceId,
        base_commit_version: 'mock-base-version',
      });
    });
  });

  describe('saveDeleteAgents', () => {
    it('应该正确删除代理', async () => {
      const agentId = 'agent-to-delete';
      await saveDeleteAgents(agentId);

      // 验证 saveFetcher 被调用，并且参数正确
      expect(saveFetcher).toHaveBeenCalledWith(
        expect.any(Function),
        ItemTypeExtra.MultiAgent,
      );

      // 获取并执行 saveFetcher 的第一个参数（函数）
      const saveRequestFn = (saveFetcher as any).mock.calls[0][0];
      await saveRequestFn();

      // 验证 UpdateAgentV2 被调用，并且参数正确
      expect(PlaygroundApi.UpdateAgentV2).toHaveBeenCalledWith({
        bot_id: mockBotId,
        space_id: mockSpaceId,
        id: agentId,
        is_delete: true,
        base_commit_version: 'mock-base-version',
      });
    });
  });

  describe('saveMultiAgentData', () => {
    it('应该正确保存多代理数据', async () => {
      await saveMultiAgentData();

      // 验证 saveFetcher 被调用，并且参数正确
      expect(saveFetcher).toHaveBeenCalledWith(
        expect.any(Function),
        ItemTypeExtra.MultiAgent,
      );

      // 获取并执行 saveFetcher 的第一个参数（函数）
      const saveRequestFn = (saveFetcher as any).mock.calls[0][0];
      await saveRequestFn();

      // 验证 UpdateMultiAgent 被调用，并且参数正确
      expect(PlaygroundApi.UpdateMultiAgent).toHaveBeenCalledWith({
        space_id: mockSpaceId,
        bot_id: mockBotId,
        session_type: mockChatModeConfig.type,
        base_commit_version: 'mock-base-version',
      });
    });
  });

  describe('saveConnectorType', () => {
    it('应该正确保存连接器类型', async () => {
      // 使用数字代替枚举值
      const connectorType = 0; // 假设 0 代表 Straight
      await saveConnectorType(connectorType as any);

      // 验证 saveFetcher 被调用，并且参数正确
      expect(saveFetcher).toHaveBeenCalledWith(
        expect.any(Function),
        ItemTypeExtra.ConnectorType,
      );

      // 获取并执行 saveFetcher 的第一个参数（函数）
      const saveRequestFn = (saveFetcher as any).mock.calls[0][0];
      await saveRequestFn();

      // 验证 UpdateMultiAgent 被调用，并且参数正确
      expect(PlaygroundApi.UpdateMultiAgent).toHaveBeenCalledWith({
        space_id: mockSpaceId,
        bot_id: mockBotId,
        connector_type: connectorType,
        base_commit_version: 'mock-base-version',
      });
    });
  });
});
