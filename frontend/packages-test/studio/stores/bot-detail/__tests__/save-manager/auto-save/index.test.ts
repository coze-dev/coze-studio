import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { personaSaveManager } from '../../../src/save-manager/auto-save/persona';
import { modelSaveManager } from '../../../src/save-manager/auto-save/model';
import { autosaveManager } from '../../../src/save-manager/auto-save/index';
import { botSkillSaveManager } from '../../../src/save-manager/auto-save/bot-skill';

// 模拟依赖
vi.mock('../../../src/save-manager/auto-save/persona', () => ({
  personaSaveManager: {
    start: vi.fn(),
    close: vi.fn(),
  },
}));

vi.mock('../../../src/save-manager/auto-save/model', () => ({
  modelSaveManager: {
    start: vi.fn(),
    close: vi.fn(),
  },
}));

vi.mock('../../../src/save-manager/auto-save/bot-skill', () => ({
  botSkillSaveManager: {
    start: vi.fn(),
    close: vi.fn(),
  },
}));

describe('autosave manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 正确模拟 console.log
    vi.spyOn(console, 'log').mockImplementation(() => {
      // 什么都不做
    });
  });

  afterEach(() => {
    // 恢复原始的 console.log
    vi.restoreAllMocks();
  });

  it('应该在启动时调用所有管理器的 start 方法', () => {
    autosaveManager.start();

    // 验证 console.log 被调用
    expect(console.log).toHaveBeenCalledWith('start:>>');

    // 验证所有管理器的 start 方法被调用
    expect(personaSaveManager.start).toHaveBeenCalledTimes(1);
    expect(botSkillSaveManager.start).toHaveBeenCalledTimes(1);
    expect(modelSaveManager.start).toHaveBeenCalledTimes(1);
  });

  it('应该在关闭时调用所有管理器的 close 方法', () => {
    autosaveManager.close();

    // 验证 console.log 被调用
    expect(console.log).toHaveBeenCalledWith('close:>>');

    // 验证所有管理器的 close 方法被调用
    expect(personaSaveManager.close).toHaveBeenCalledTimes(1);
    expect(botSkillSaveManager.close).toHaveBeenCalledTimes(1);
    expect(modelSaveManager.close).toHaveBeenCalledTimes(1);
  });
});
