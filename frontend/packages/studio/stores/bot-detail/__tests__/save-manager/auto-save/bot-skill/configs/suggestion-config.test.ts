import { describe, it, expect } from 'vitest';

import { ItemType } from '../../../../../src/save-manager/types';
import { suggestionConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/suggestion-config';

describe('suggestionConfig', () => {
  it('should have correct configuration properties', () => {
    expect(suggestionConfig).toHaveProperty('key');
    expect(suggestionConfig).toHaveProperty('selector');
    expect(suggestionConfig).toHaveProperty('debounce');
    expect(suggestionConfig).toHaveProperty('middleware');
    expect(suggestionConfig.key).toBe(ItemType.SUGGESTREPLY);
  });
});
