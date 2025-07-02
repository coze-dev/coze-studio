import { describe, it, expect } from 'vitest';
import { DebounceTime } from '@coze-studio/autosave';

import { ItemType } from '../../../../../src/save-manager/types';
import { pluginConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/plugin';

describe('pluginConfig', () => {
  it('should have correct configuration properties', () => {
    expect(pluginConfig).toHaveProperty('key');
    expect(pluginConfig).toHaveProperty('selector');
    expect(pluginConfig).toHaveProperty('debounce');
    expect(pluginConfig).toHaveProperty('middleware');
    expect(pluginConfig.key).toBe(ItemType.APIINFO);
    expect(pluginConfig.debounce).toBe(DebounceTime.Immediate);
  });
});
