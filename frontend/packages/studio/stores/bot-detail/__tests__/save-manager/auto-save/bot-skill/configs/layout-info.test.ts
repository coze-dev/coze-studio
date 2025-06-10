import { describe, it, expect } from 'vitest';
import { DebounceTime } from '@coze-studio/autosave';

import { ItemTypeExtra } from '../../../../../src/save-manager/types';
import { layoutInfoConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/layout-info';

describe('layoutInfoConfig', () => {
  it('should have correct configuration properties', () => {
    expect(layoutInfoConfig).toHaveProperty('key');
    expect(layoutInfoConfig).toHaveProperty('selector');
    expect(layoutInfoConfig).toHaveProperty('debounce');
    expect(layoutInfoConfig).toHaveProperty('middleware');
    expect(layoutInfoConfig.key).toBe(ItemTypeExtra.LayoutInfo);
    expect(layoutInfoConfig.debounce).toBe(DebounceTime.Immediate);
  });
});
