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
 
import { describe, it, expect, vi } from 'vitest';

import { setterActionFactory } from '../../src/utils/setter-factory';

describe('setterActionFactory', () => {
  it('应该创建一个增量更新函数', () => {
    // 创建模拟的 set 函数
    const mockSet = vi.fn(updater => {
      if (typeof updater === 'function') {
        return updater({ a: 1, b: 2 });
      }
      return updater;
    });

    // 创建 setter 函数
    const setter = setterActionFactory(mockSet);

    // 调用 setter 进行增量更新
    setter({ a: 3 });

    // 验证 set 函数被调用
    expect(mockSet).toHaveBeenCalled();

    // 验证更新后的状态
    const updater = mockSet.mock.calls[0][0];
    const result = updater({ a: 1, b: 2 });
    expect(result).toEqual({ a: 3, b: 2 });
  });

  it('应该创建一个全量更新函数', () => {
    // 创建模拟的 set 函数
    const mockSet = vi.fn();

    // 创建 setter 函数
    const setter = setterActionFactory(mockSet);

    // 调用 setter 进行全量更新
    setter({ a: 3 }, { replace: true });

    // 验证 set 函数被调用，并且传入了正确的参数
    expect(mockSet).toHaveBeenCalledWith({ a: 3 });
  });

  it('应该处理空对象的增量更新', () => {
    // 创建模拟的 set 函数
    const mockSet = vi.fn(updater => {
      if (typeof updater === 'function') {
        return updater({});
      }
      return updater;
    });

    // 创建 setter 函数
    const setter = setterActionFactory(mockSet);

    // 调用 setter 进行增量更新
    setter({ a: 1 });

    // 验证 set 函数被调用
    expect(mockSet).toHaveBeenCalled();

    // 验证更新后的状态
    const updater = mockSet.mock.calls[0][0];
    const result = updater({});
    expect(result).toEqual({ a: 1 });
  });

  it('应该处理空对象的全量更新', () => {
    // 创建模拟的 set 函数
    const mockSet = vi.fn();

    // 创建 setter 函数
    const setter = setterActionFactory(mockSet);

    // 调用 setter 进行全量更新
    setter({}, { replace: true });

    // 验证 set 函数被调用，并且传入了正确的参数
    expect(mockSet).toHaveBeenCalledWith({});
  });

  it('应该处理复杂对象的增量更新', () => {
    // 创建一个复杂的初始状态
    const initialState = {
      user: { name: 'John', age: 30 },
      settings: { theme: 'dark', notifications: true },
    };

    // 创建模拟的 set 函数
    const mockSet = vi.fn(updater => {
      if (typeof updater === 'function') {
        return updater(initialState);
      }
      return updater;
    });

    // 创建 setter 函数
    const setter = setterActionFactory(mockSet);

    // 调用 setter 进行增量更新
    setter({
      user: { name: 'Jane', age: 25 },
    });

    // 验证 set 函数被调用
    expect(mockSet).toHaveBeenCalled();

    // 验证更新后的状态
    const updater = mockSet.mock.calls[0][0];
    const result = updater(initialState);

    // 检查结果是否正确合并了对象
    expect(result).toEqual({
      user: { name: 'Jane', age: 25 },
      settings: { theme: 'dark', notifications: true },
    });
  });
});
