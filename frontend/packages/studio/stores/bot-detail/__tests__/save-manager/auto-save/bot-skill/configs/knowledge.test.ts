/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    // Verify debounce configuration
    if (typeof knowledgeConfig.debounce === 'object') {
      expect(knowledgeConfig.debounce).toHaveProperty('default');
      expect(knowledgeConfig.debounce).toHaveProperty('dataSetInfo.min_score');
      expect(knowledgeConfig.debounce).toHaveProperty('dataSetInfo.top_k');
    }
  });
});
