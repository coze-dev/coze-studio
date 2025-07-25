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

import { i18nContext } from '../../src/i18n-provider/context';

describe('i18n-provider/context', () => {
  it('should create a context with default values', () => {
    // 验证 i18nContext 是否被正确创建
    expect(i18nContext).toBeDefined();

    // 获取默认值 - 使用类型断言访问内部属性
    // @ts-expect-error - 访问内部属性
    const defaultValue = i18nContext._currentValue;

    // 验证默认值中的 i18n 对象是否存在
    expect(defaultValue.i18n).toBeDefined();

    // 验证 t 函数是否存在
    expect(defaultValue.i18n.t).toBeDefined();
    expect(typeof defaultValue.i18n.t).toBe('function');

    // 验证 t 函数的行为
    expect(defaultValue.i18n.t('test-key')).toBe('test-key');

    // 验证 i18nContext 是一个对象
    expect(typeof i18nContext).toBe('object');
  });
});
