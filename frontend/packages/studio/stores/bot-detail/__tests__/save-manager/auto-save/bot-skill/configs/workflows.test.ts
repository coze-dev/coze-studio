import { describe, it, expect } from 'vitest';
import { DebounceTime } from '@coze-studio/autosave';

import { ItemType } from '../../../../../src/save-manager/types';
import { workflowsConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/workflows';

describe('workflowsConfig', () => {
  it('should have correct configuration properties', () => {
    expect(workflowsConfig).toHaveProperty('key');
    expect(workflowsConfig).toHaveProperty('selector');
    expect(workflowsConfig).toHaveProperty('debounce');
    expect(workflowsConfig).toHaveProperty('middleware');
    expect(workflowsConfig.key).toBe(ItemType.WORKFLOW);
    expect(workflowsConfig.debounce).toBe(DebounceTime.Immediate);
  });
});
