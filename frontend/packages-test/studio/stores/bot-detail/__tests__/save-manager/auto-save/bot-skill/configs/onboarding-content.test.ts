import { describe, it, expect } from 'vitest';

import { ItemType } from '../../../../../src/save-manager/types';
import { onboardingConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/onboarding-content';

describe('onboardingConfig', () => {
  it('should have correct configuration properties', () => {
    expect(onboardingConfig).toHaveProperty('key');
    expect(onboardingConfig).toHaveProperty('selector');
    expect(onboardingConfig).toHaveProperty('debounce');
    expect(onboardingConfig).toHaveProperty('middleware');
    expect(onboardingConfig.key).toBe(ItemType.ONBOARDING);
    // 验证 debounce 配置
    if (typeof onboardingConfig.debounce === 'object') {
      expect(onboardingConfig.debounce).toHaveProperty('default');
      expect(onboardingConfig.debounce).toHaveProperty('prologue');
      expect(onboardingConfig.debounce).toHaveProperty('suggested_questions');
    }
  });
});
