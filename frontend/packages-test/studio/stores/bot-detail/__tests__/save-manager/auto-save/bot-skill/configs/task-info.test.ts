import { describe, it, expect } from 'vitest';
import { DebounceTime } from '@coze-studio/autosave';

import { ItemType } from '../../../../../src/save-manager/types';
import { taskInfoConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/task-info';

describe('taskInfoConfig', () => {
  it('should have correct configuration properties', () => {
    expect(taskInfoConfig).toHaveProperty('key');
    expect(taskInfoConfig).toHaveProperty('selector');
    expect(taskInfoConfig).toHaveProperty('debounce');
    expect(taskInfoConfig).toHaveProperty('middleware');
    expect(taskInfoConfig.key).toBe(ItemType.TASK);
    expect(taskInfoConfig.debounce).toBe(DebounceTime.Immediate);
  });
});
