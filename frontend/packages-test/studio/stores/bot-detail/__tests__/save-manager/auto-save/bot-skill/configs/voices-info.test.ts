import { describe, it, expect } from 'vitest';
import { DebounceTime } from '@coze-studio/autosave';

import { ItemType } from '../../../../../src/save-manager/types';
import { voicesInfoConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/voices-info';

describe('voicesInfoConfig', () => {
  it('should have correct configuration properties', () => {
    expect(voicesInfoConfig).toHaveProperty('key');
    expect(voicesInfoConfig).toHaveProperty('selector');
    expect(voicesInfoConfig).toHaveProperty('debounce');
    expect(voicesInfoConfig).toHaveProperty('middleware');
    expect(voicesInfoConfig.key).toBe(ItemType.PROFILEMEMORY);
    expect(voicesInfoConfig.debounce).toBe(DebounceTime.Immediate);
  });
});
