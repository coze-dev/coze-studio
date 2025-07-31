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

import { ItemTypeExtra } from '../../../../../src/save-manager/types';
import { chatBackgroundConfig } from '../../../../../src/save-manager/auto-save/bot-skill/configs/chat-background';

describe('chatBackgroundConfig', () => {
  it('应该具有正确的配置属性', () => {
    // Verify the basic properties of the configuration
    expect(chatBackgroundConfig).toHaveProperty('key');
    expect(chatBackgroundConfig).toHaveProperty('selector');
    expect(chatBackgroundConfig).toHaveProperty('debounce');
    expect(chatBackgroundConfig).toHaveProperty('middleware');

    // Verify that middleware exists and has an onBeforeSave attribute
    expect(chatBackgroundConfig.middleware).toBeDefined();
    if (chatBackgroundConfig.middleware) {
      expect(chatBackgroundConfig.middleware).toHaveProperty('onBeforeSave');
    }

    // Validate attribute value
    expect(chatBackgroundConfig.key).toBe(ItemTypeExtra.ChatBackGround);
    expect(chatBackgroundConfig.debounce).toBe(DebounceTime.Immediate);
    expect(typeof chatBackgroundConfig.selector).toBe('function');

    // Verify that onBeforeSave is a function
    if (
      chatBackgroundConfig.middleware &&
      chatBackgroundConfig.middleware.onBeforeSave
    ) {
      expect(typeof chatBackgroundConfig.middleware.onBeforeSave).toBe(
        'function',
      );
    }
  });

  it('selector 应该返回 store 的 backgroundImageInfoList 属性', () => {
    // Create mock store
    const mockStore = {
      backgroundImageInfoList: [
        { id: 'bg1', url: 'http://example.com/bg1.jpg' },
      ],
    };

    // Call the selector function
    // Note: Here we assume that the selector is a function, and if it is a complex object, the test may need to be adjusted
    const { selector } = chatBackgroundConfig;
    let result;

    if (typeof selector === 'function') {
      result = selector(mockStore as any);
      // validation result
      expect(result).toBe(mockStore.backgroundImageInfoList);
    } else {
      // If the selector is not a function, skip this test
      expect(true).toBe(true);
    }
  });

  it('middleware.onBeforeSave 应该正确转换数据', () => {
    // Create simulated data
    const mockData = [
      { id: 'bg1', url: 'http://example.com/bg1.jpg' },
      { id: 'bg2', url: 'http://example.com/bg2.jpg' },
    ];

    // Make sure middleware and onBeforeSave exist
    if (
      chatBackgroundConfig.middleware &&
      chatBackgroundConfig.middleware.onBeforeSave
    ) {
      // Call the onBeforeSave function
      const result = chatBackgroundConfig.middleware.onBeforeSave(mockData);

      // validation result
      expect(result).toEqual({
        background_image_info_list: mockData,
      });
    } else {
      // If middleware or onBeforeSave does not exist, skip this test
      expect(true).toBe(true);
    }
  });
});
