import { describe, it, expect } from 'vitest';
import { DebounceTime } from '@coze-studio/autosave';

import { ItemType } from '../../../../../src/save-manager/types';
import { variablesConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/variables';

describe('variablesConfig', () => {
  it('should have correct configuration properties', () => {
    expect(variablesConfig).toHaveProperty('key');
    expect(variablesConfig).toHaveProperty('selector');
    expect(variablesConfig).toHaveProperty('debounce');
    expect(variablesConfig).toHaveProperty('middleware');
    expect(variablesConfig.key).toBe(ItemType.PROFILEMEMORY);
    expect(variablesConfig.debounce).toBe(DebounceTime.Immediate);
  });
});
