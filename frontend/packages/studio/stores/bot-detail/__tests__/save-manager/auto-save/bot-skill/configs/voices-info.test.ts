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
