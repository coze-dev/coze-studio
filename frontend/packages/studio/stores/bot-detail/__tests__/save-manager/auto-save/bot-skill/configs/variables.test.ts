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
