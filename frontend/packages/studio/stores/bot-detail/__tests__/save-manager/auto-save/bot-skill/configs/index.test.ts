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

import { workflowsConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/workflows';
import { voicesInfoConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/voices-info';
import { variablesConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/variables';
import { taskInfoConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/task-info';
import { suggestionConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/suggestion-config';
import { pluginConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/plugin';
import { onboardingConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/onboarding-content';
import { layoutInfoConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/layout-info';
import { knowledgeConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/knowledge';
import { chatBackgroundConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/chat-background';
import { registers } from '../../../../../src/save-manager/auto-save/bot-skill/configs';

// simulated dependency
vi.mock(
  '../../../../../src/save-manager/auto-save/bot-skill/configs/workflows',
  () => ({
    workflowsConfig: { key: 'workflows', selector: vi.fn() },
  }),
);

vi.mock(
  '../../../../../src/save-manager/auto-save/bot-skill/configs/voices-info',
  () => ({
    voicesInfoConfig: { key: 'voicesInfo', selector: vi.fn() },
  }),
);

vi.mock(
  '../../../../../src/save-manager/auto-save/bot-skill/configs/variables',
  () => ({
    variablesConfig: { key: 'variables', selector: vi.fn() },
  }),
);

vi.mock(
  '../../../../../src/save-manager/auto-save/bot-skill/configs/task-info',
  () => ({
    taskInfoConfig: { key: 'taskInfo', selector: vi.fn() },
  }),
);

vi.mock(
  '../../../../../src/save-manager/auto-save/bot-skill/configs/suggestion-config',
  () => ({
    suggestionConfig: { key: 'suggestionConfig', selector: vi.fn() },
  }),
);

vi.mock(
  '../../../../../src/save-manager/auto-save/bot-skill/configs/plugin',
  () => ({
    pluginConfig: { key: 'plugin', selector: vi.fn() },
  }),
);

vi.mock(
  '../../../../../src/save-manager/auto-save/bot-skill/configs/onboarding-content',
  () => ({
    onboardingConfig: { key: 'onboarding', selector: vi.fn() },
  }),
);

vi.mock(
  '../../../../../src/save-manager/auto-save/bot-skill/configs/layout-info',
  () => ({
    layoutInfoConfig: { key: 'layoutInfo', selector: vi.fn() },
  }),
);

vi.mock(
  '../../../../../src/save-manager/auto-save/bot-skill/configs/knowledge',
  () => ({
    knowledgeConfig: { key: 'knowledge', selector: vi.fn() },
  }),
);

vi.mock(
  '../../../../../src/save-manager/auto-save/bot-skill/configs/chat-background',
  () => ({
    chatBackgroundConfig: { key: 'chatBackground', selector: vi.fn() },
  }),
);

describe('bot-skill configs', () => {
  it('应该正确注册所有配置', () => {
    // Verify that the registers array contains all configurations
    expect(registers).toContain(pluginConfig);
    expect(registers).toContain(chatBackgroundConfig);
    expect(registers).toContain(onboardingConfig);
    expect(registers).toContain(knowledgeConfig);
    expect(registers).toContain(layoutInfoConfig);
    expect(registers).toContain(suggestionConfig);
    expect(registers).toContain(taskInfoConfig);
    expect(registers).toContain(variablesConfig);
    expect(registers).toContain(workflowsConfig);
    expect(registers).toContain(voicesInfoConfig);

    // Verify the length of the registers array
    expect(registers.length).toBe(10);
  });

  it('每个配置都应该有 key 和 selector 属性', () => {
    registers.forEach(config => {
      expect(config).toHaveProperty('key');
      expect(config).toHaveProperty('selector');
      expect(typeof config.key).toBe('string');
      expect(typeof config.selector).toBe('function');
    });
  });
});
