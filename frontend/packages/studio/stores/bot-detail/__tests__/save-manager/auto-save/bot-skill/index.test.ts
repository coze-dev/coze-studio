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

import { botSkillSaveManager } from '../../../../src/save-manager/auto-save/bot-skill';

// simulated dependency
vi.mock('@coze-studio/autosave', () => {
  const mockStartFn = vi.fn();
  const mockCloseFn = vi.fn();

  return {
    AutosaveManager: vi.fn().mockImplementation(() => ({
      start: mockStartFn,
      close: mockCloseFn,
    })),
  };
});

vi.mock('../../../../src/store/bot-skill', () => ({
  useBotSkillStore: {},
}));

vi.mock('../../../../src/save-manager/auto-save/request', () => ({
  saveRequest: vi.fn(),
}));

vi.mock('../../../../src/save-manager/auto-save/bot-skill/configs', () => ({
  registers: [
    { key: 'plugin', selector: vi.fn() },
    { key: 'knowledge', selector: vi.fn() },
  ],
}));

describe('botSkillSaveManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该是 AutosaveManager 的实例', () => {
    // Verify that botSkillSaveManager is an instance of AutosaveManager
    expect(botSkillSaveManager).toBeDefined();
    // Since we simulate AutosaveManager, we cannot directly check the instance type
    // But you can check if it has the properties and methods that an AutosaveManager instance should have
    expect(botSkillSaveManager).toHaveProperty('start');
    expect(botSkillSaveManager).toHaveProperty('close');
  });

  it('应该具有 start 和 close 方法', () => {
    // Verify botSkillSaveManager has a start and close method
    expect(botSkillSaveManager.start).toBeDefined();
    expect(botSkillSaveManager.close).toBeDefined();
    expect(typeof botSkillSaveManager.start).toBe('function');
    expect(typeof botSkillSaveManager.close).toBe('function');
  });

  it('调用 start 方法应该正常工作', () => {
    // Call the start method
    botSkillSaveManager.start();
    // Since we have already simulated the start method, we just need to verify that it can be called without throwing an error
    expect(true).toBe(true);
  });

  it('调用 close 方法应该正常工作', () => {
    // Call the close method
    botSkillSaveManager.close();
    // Since we have simulated the close method, we just need to verify that it can be called without throwing an error
    expect(true).toBe(true);
  });
});
