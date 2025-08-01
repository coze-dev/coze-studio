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

import { uniqMemoryList } from '../../src/utils/uniq-memory-list';
import { VariableKeyErrType } from '../../src/types/skill';

describe('uniqMemoryList', () => {
  it('应该正确标记唯一的键为 KEY_CHECK_PASS', () => {
    const list = [
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' },
      { key: 'key3', value: 'value3' },
    ];

    const result = uniqMemoryList(list);

    expect(result).toHaveLength(3);
    expect(result[0].errType).toBe(VariableKeyErrType.KEY_CHECK_PASS);
    expect(result[1].errType).toBe(VariableKeyErrType.KEY_CHECK_PASS);
    expect(result[2].errType).toBe(VariableKeyErrType.KEY_CHECK_PASS);
  });

  it('应该正确标记重复的键为 KEY_NAME_USED', () => {
    const list = [
      { key: 'key1', value: 'value1' },
      { key: 'key1', value: 'value2' }, // Duplicate key
      { key: 'key3', value: 'value3' },
    ];

    const result = uniqMemoryList(list);

    expect(result).toHaveLength(3);
    expect(result[0].errType).toBe(VariableKeyErrType.KEY_NAME_USED);
    expect(result[1].errType).toBe(VariableKeyErrType.KEY_NAME_USED);
    expect(result[2].errType).toBe(VariableKeyErrType.KEY_CHECK_PASS);
  });

  it('应该正确标记空键为 KEY_IS_NULL', () => {
    const list = [
      { key: '', value: 'value1' }, // empty key
      { key: 'key2', value: 'value2' },
      { key: 'key3', value: 'value3' },
    ];

    const result = uniqMemoryList(list);

    expect(result).toHaveLength(3);
    expect(result[0].errType).toBe(VariableKeyErrType.KEY_IS_NULL);
    expect(result[1].errType).toBe(VariableKeyErrType.KEY_CHECK_PASS);
    expect(result[2].errType).toBe(VariableKeyErrType.KEY_CHECK_PASS);
  });

  it('应该正确标记与系统变量冲突的键为 KEY_NAME_USED', () => {
    const list = [
      { key: 'sysKey1', value: 'value1' },
      { key: 'key2', value: 'value2' },
      { key: 'key3', value: 'value3' },
    ];

    const sysVariables = [{ key: 'sysKey1', value: 'sysValue1' }];

    const result = uniqMemoryList(list, sysVariables);

    expect(result).toHaveLength(3);
    expect(result[0].errType).toBe(VariableKeyErrType.KEY_NAME_USED);
    expect(result[1].errType).toBe(VariableKeyErrType.KEY_CHECK_PASS);
    expect(result[2].errType).toBe(VariableKeyErrType.KEY_CHECK_PASS);
  });

  it('应该处理空列表', () => {
    const list: any[] = [];

    const result = uniqMemoryList(list);

    expect(result).toHaveLength(0);
  });

  it('应该保留原始对象的其他属性', () => {
    const list = [
      { key: 'key1', value: 'value1', description: 'desc1' },
      { key: 'key2', value: 'value2', description: 'desc2' },
    ];

    const result = uniqMemoryList(list);

    expect(result).toHaveLength(2);
    expect(result[0].description).toBe('desc1');
    expect(result[1].description).toBe('desc2');
  });
});
