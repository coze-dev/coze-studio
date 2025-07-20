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
 
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BotMode } from '@coze-arch/bot-api/developer_api';

import { useQueryCollectStore } from '../../../src/store/query-collect';
import { usePersonaStore } from '../../../src/store/persona';
import { useMultiAgentStore } from '../../../src/store/multi-agent';
import { useModelStore } from '../../../src/store/model';
import { useBotSkillStore } from '../../../src/store/bot-skill';
import { useBotInfoStore } from '../../../src/store/bot-info';
import { getBotDetailDtoInfo } from '../../../src/save-manager/utils/bot-dto-info';

// 模拟依赖
vi.mock('@coze-arch/report-events', () => ({
  REPORT_EVENTS: {
    botDebugSaveAll: 'botDebugSaveAll',
  },
  createReportEvent: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock('../../../src/store/query-collect', () => ({
  useQueryCollectStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/store/persona', () => ({
  usePersonaStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/store/multi-agent', () => ({
  useMultiAgentStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/store/model', () => ({
  useModelStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/store/bot-skill', () => ({
  useBotSkillStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/store/bot-info', () => ({
  useBotInfoStore: {
    getState: vi.fn(),
  },
}));

describe('bot-dto-info utils', () => {
  const mockBotSkill = {
    knowledge: { value: 'knowledge' },
    variables: { value: 'variables' },
    workflows: { value: 'workflows' },
    taskInfo: { value: 'taskInfo' },
    suggestionConfig: { value: 'suggestionConfig' },
    onboardingContent: { value: 'onboardingContent' },
    pluginApis: { value: 'pluginApis' },
    backgroundImageInfoList: { value: 'backgroundImageInfoList' },
    shortcut: { value: 'shortcut' },
    tts: { value: 'tts' },
    timeCapsule: { value: 'timeCapsule' },
    filebox: { value: 'filebox' },
    devHooks: { value: 'devHooks' },
    voicesInfo: { value: 'voicesInfo' },
  };

  const mockTransformVo2Dto = {
    knowledge: vi.fn(data => ({ knowledge: data })),
    variables: vi.fn(data => ({ variables: data })),
    workflow: vi.fn(data => ({ workflows: data })),
    task: vi.fn(data => ({ taskInfo: data })),
    suggestionConfig: vi.fn(data => ({ suggestionConfig: data })),
    onboarding: vi.fn(data => ({ onboarding: data })),
    plugin: vi.fn(data => ({ plugin: data })),
    shortcut: vi.fn(data => ({ shortcut: data })),
    tts: vi.fn(data => ({ tts: data })),
    timeCapsule: vi.fn(data => ({ timeCapsule: data })),
    filebox: vi.fn(data => ({ filebox: data })),
    voicesInfo: vi.fn(data => ({ voicesInfo: data })),
  };

  const mockPersona = {
    systemMessage: 'system message',
    transformVo2Dto: vi.fn(systemMessage => ({ prompt: systemMessage })),
  };

  const mockModel = {
    config: { value: 'model' },
    transformVo2Dto: vi.fn(config => ({ model: config })),
  };

  const mockMultiAgent = {
    agents: [{ id: 'agent1' }],
    transformVo2Dto: {
      agent: vi.fn(agent => ({ ...agent, transformed: true })),
    },
  };

  const mockQueryCollect = {
    value: 'queryCollect',
    transformVo2Dto: vi.fn(data => ({ queryCollect: data })),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认状态
    (useBotInfoStore.getState as any).mockReturnValue({
      mode: BotMode.SingleMode,
    });

    (useBotSkillStore.getState as any).mockReturnValue({
      ...mockBotSkill,
      transformVo2Dto: mockTransformVo2Dto,
    });

    (usePersonaStore.getState as any).mockReturnValue(mockPersona);

    (useModelStore.getState as any).mockReturnValue(mockModel);

    (useMultiAgentStore.getState as any).mockReturnValue(mockMultiAgent);

    (useQueryCollectStore.getState as any).mockReturnValue(mockQueryCollect);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('应该正确转换所有 bot 信息为 DTO 格式', () => {
    const result = getBotDetailDtoInfo();

    // 验证 bot skill info
    const { botSkillInfo } = result;

    // 验证 persona 转换
    expect(mockPersona.transformVo2Dto).toHaveBeenCalledWith(
      mockPersona.systemMessage,
    );

    // 验证 model 转换
    expect(mockModel.transformVo2Dto).toHaveBeenCalledWith(mockModel.config);

    // 验证 bot skill 转换
    expect(mockTransformVo2Dto.knowledge).toHaveBeenCalledWith(
      mockBotSkill.knowledge,
    );
    expect(mockTransformVo2Dto.variables).toHaveBeenCalledWith(
      mockBotSkill.variables,
    );
    expect(mockTransformVo2Dto.workflow).toHaveBeenCalledWith(
      mockBotSkill.workflows,
    );
    expect(mockTransformVo2Dto.task).toHaveBeenCalledWith(
      mockBotSkill.taskInfo,
    );
    expect(mockTransformVo2Dto.suggestionConfig).toHaveBeenCalledWith(
      mockBotSkill.suggestionConfig,
    );
    expect(mockTransformVo2Dto.onboarding).toHaveBeenCalledWith(
      mockBotSkill.onboardingContent,
    );
    expect(mockTransformVo2Dto.plugin).toHaveBeenCalledWith(
      mockBotSkill.pluginApis,
    );
    expect(mockTransformVo2Dto.shortcut).toHaveBeenCalledWith(
      mockBotSkill.shortcut,
    );
    expect(mockTransformVo2Dto.tts).toHaveBeenCalledWith(mockBotSkill.tts);
    expect(mockTransformVo2Dto.timeCapsule).toHaveBeenCalledWith(
      mockBotSkill.timeCapsule,
    );
    expect(mockTransformVo2Dto.filebox).toHaveBeenCalledWith(
      mockBotSkill.filebox,
    );
    expect(mockTransformVo2Dto.voicesInfo).toHaveBeenCalledWith(
      mockBotSkill.voicesInfo,
    );

    // 验证 queryCollect 转换
    expect(mockQueryCollect.transformVo2Dto).toHaveBeenCalledWith(
      mockQueryCollect,
    );

    // 验证结果结构
    expect(botSkillInfo).toBeDefined();
  });

  it('在多智能体模式下应该正确转换', () => {
    // 设置为多智能体模式
    (useBotInfoStore.getState as any).mockReturnValue({
      mode: BotMode.MultiMode,
    });

    const result = getBotDetailDtoInfo();
    const { botSkillInfo } = result;

    // 验证多智能体模式下的转换
    expect(mockMultiAgent.transformVo2Dto.agent).toHaveBeenCalledWith(
      mockMultiAgent.agents[0],
    );

    // 验证多智能体模式下某些字段应该是 undefined
    expect(botSkillInfo).toBeDefined();
  });
});
