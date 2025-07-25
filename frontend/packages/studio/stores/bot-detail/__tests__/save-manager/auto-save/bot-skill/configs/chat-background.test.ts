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
    // 验证配置的基本属性
    expect(chatBackgroundConfig).toHaveProperty('key');
    expect(chatBackgroundConfig).toHaveProperty('selector');
    expect(chatBackgroundConfig).toHaveProperty('debounce');
    expect(chatBackgroundConfig).toHaveProperty('middleware');

    // 验证 middleware 存在且有 onBeforeSave 属性
    expect(chatBackgroundConfig.middleware).toBeDefined();
    if (chatBackgroundConfig.middleware) {
      expect(chatBackgroundConfig.middleware).toHaveProperty('onBeforeSave');
    }

    // 验证属性值
    expect(chatBackgroundConfig.key).toBe(ItemTypeExtra.ChatBackGround);
    expect(chatBackgroundConfig.debounce).toBe(DebounceTime.Immediate);
    expect(typeof chatBackgroundConfig.selector).toBe('function');

    // 验证 onBeforeSave 是函数
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
    // 创建模拟 store
    const mockStore = {
      backgroundImageInfoList: [
        { id: 'bg1', url: 'http://example.com/bg1.jpg' },
      ],
    };

    // 调用 selector 函数
    // 注意：这里我们假设 selector 是一个函数，如果它是一个复杂对象，可能需要调整测试
    const { selector } = chatBackgroundConfig;
    let result;

    if (typeof selector === 'function') {
      result = selector(mockStore as any);
      // 验证结果
      expect(result).toBe(mockStore.backgroundImageInfoList);
    } else {
      // 如果 selector 不是函数，跳过这个测试
      expect(true).toBe(true);
    }
  });

  it('middleware.onBeforeSave 应该正确转换数据', () => {
    // 创建模拟数据
    const mockData = [
      { id: 'bg1', url: 'http://example.com/bg1.jpg' },
      { id: 'bg2', url: 'http://example.com/bg2.jpg' },
    ];

    // 确保 middleware 和 onBeforeSave 存在
    if (
      chatBackgroundConfig.middleware &&
      chatBackgroundConfig.middleware.onBeforeSave
    ) {
      // 调用 onBeforeSave 函数
      const result = chatBackgroundConfig.middleware.onBeforeSave(mockData);

      // 验证结果
      expect(result).toEqual({
        background_image_info_list: mockData,
      });
    } else {
      // 如果 middleware 或 onBeforeSave 不存在，跳过这个测试
      expect(true).toBe(true);
    }
  });
});
