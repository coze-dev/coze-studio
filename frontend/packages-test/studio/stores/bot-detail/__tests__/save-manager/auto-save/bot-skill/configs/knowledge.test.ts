import { describe, it, expect } from 'vitest';

import { ItemType } from '../../../../../src/save-manager/types';
import { knowledgeConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/knowledge';

describe('knowledgeConfig', () => {
  it('should have correct configuration properties', () => {
    expect(knowledgeConfig).toHaveProperty('key');
    expect(knowledgeConfig).toHaveProperty('selector');
    expect(knowledgeConfig).toHaveProperty('debounce');
    expect(knowledgeConfig).toHaveProperty('middleware');
    expect(knowledgeConfig.key).toBe(ItemType.DataSet);
    // 验证 debounce 配置
    if (typeof knowledgeConfig.debounce === 'object') {
      expect(knowledgeConfig.debounce).toHaveProperty('default');
      expect(knowledgeConfig.debounce).toHaveProperty('dataSetInfo.min_score');
      expect(knowledgeConfig.debounce).toHaveProperty('dataSetInfo.top_k');
    }
  });
});
