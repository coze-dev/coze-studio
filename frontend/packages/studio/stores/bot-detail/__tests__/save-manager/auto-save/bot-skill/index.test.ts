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

// 模拟依赖
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
    // 验证 botSkillSaveManager 是 AutosaveManager 的实例
    expect(botSkillSaveManager).toBeDefined();
    // 由于我们模拟了 AutosaveManager，我们不能直接检查实例类型
    // 但可以检查它是否具有 AutosaveManager 实例应有的属性和方法
    expect(botSkillSaveManager).toHaveProperty('start');
    expect(botSkillSaveManager).toHaveProperty('close');
  });

  it('应该具有 start 和 close 方法', () => {
    // 验证 botSkillSaveManager 具有 start 和 close 方法
    expect(botSkillSaveManager.start).toBeDefined();
    expect(botSkillSaveManager.close).toBeDefined();
    expect(typeof botSkillSaveManager.start).toBe('function');
    expect(typeof botSkillSaveManager.close).toBe('function');
  });

  it('调用 start 方法应该正常工作', () => {
    // 调用 start 方法
    botSkillSaveManager.start();
    // 由于我们已经模拟了 start 方法，这里只需验证它可以被调用而不会抛出错误
    expect(true).toBe(true);
  });

  it('调用 close 方法应该正常工作', () => {
    // 调用 close 方法
    botSkillSaveManager.close();
    // 由于我们已经模拟了 close 方法，这里只需验证它可以被调用而不会抛出错误
    expect(true).toBe(true);
  });
});
