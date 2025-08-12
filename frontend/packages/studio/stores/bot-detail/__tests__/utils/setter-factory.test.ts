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
    // Create a simulated set function
    const mockSet = vi.fn(updater => {
      if (typeof updater === 'function') {
        return updater({ a: 1, b: 2 });
      }
      return updater;
    });

    // Create a setter function
    const setter = setterActionFactory(mockSet);

    // Call setter for incremental update
    setter({ a: 3 });

    // Verify that the set function is called
    expect(mockSet).toHaveBeenCalled();

    // Verify the updated status
    const updater = mockSet.mock.calls[0][0];
    const result = updater({ a: 1, b: 2 });
    expect(result).toEqual({ a: 3, b: 2 });
  });

  it('应该创建一个全量更新函数', () => {
    // Create a simulated set function
    const mockSet = vi.fn();

    // Create a setter function
    const setter = setterActionFactory(mockSet);

    // Call setter for full update
    setter({ a: 3 }, { replace: true });

    // Verify that the set function is called and the correct parameters are passed in
    expect(mockSet).toHaveBeenCalledWith({ a: 3 });
  });

  it('应该处理空对象的增量更新', () => {
    // Create a simulated set function
    const mockSet = vi.fn(updater => {
      if (typeof updater === 'function') {
        return updater({});
      }
      return updater;
    });

    // Create a setter function
    const setter = setterActionFactory(mockSet);

    // Call setter for incremental update
    setter({ a: 1 });

    // Verify that the set function is called
    expect(mockSet).toHaveBeenCalled();

    // Verify the updated status
    const updater = mockSet.mock.calls[0][0];
    const result = updater({});
    expect(result).toEqual({ a: 1 });
  });

  it('应该处理空对象的全量更新', () => {
    // Create a simulated set function
    const mockSet = vi.fn();

    // Create a setter function
    const setter = setterActionFactory(mockSet);

    // Call setter for full update
    setter({}, { replace: true });

    // Verify that the set function is called and the correct parameters are passed in
    expect(mockSet).toHaveBeenCalledWith({});
  });

  it('应该处理复杂对象的增量更新', () => {
    // Create a complex initial state
    const initialState = {
      user: { name: 'John', age: 30 },
      settings: { theme: 'dark', notifications: true },
    };

    // Create a simulated set function
    const mockSet = vi.fn(updater => {
      if (typeof updater === 'function') {
        return updater(initialState);
      }
      return updater;
    });

    // Create a setter function
    const setter = setterActionFactory(mockSet);

    // Call setter for incremental update
    setter({
      user: { name: 'Jane', age: 25 },
    });

    // Verify that the set function is called
    expect(mockSet).toHaveBeenCalled();

    // Verify the updated status
    const updater = mockSet.mock.calls[0][0];
    const result = updater(initialState);

    // Check if the result is correct and the objects are merged.
    expect(result).toEqual({
      user: { name: 'Jane', age: 25 },
      settings: { theme: 'dark', notifications: true },
    });
  });
});
