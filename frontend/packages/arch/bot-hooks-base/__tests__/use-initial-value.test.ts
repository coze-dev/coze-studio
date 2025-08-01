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
import { renderHook } from '@testing-library/react';

import { useInitialValue } from '../src/use-initial-value';

describe('useInitialValue', () => {
  it('should return the initial value', () => {
    const initialValue = 'test';
    const { result } = renderHook(() => useInitialValue(initialValue));
    expect(result.current).toBe(initialValue);
  });

  it('should maintain the initial value even if input changes', () => {
    let value = 'initial';
    const { result, rerender } = renderHook(() => useInitialValue(value));
    expect(result.current).toBe('initial');

    value = 'changed';
    rerender();
    expect(result.current).toBe('initial');
  });

  it('should work with different types', () => {
    const numberValue = 42;
    const { result: numberResult } = renderHook(() =>
      useInitialValue(numberValue),
    );
    expect(numberResult.current).toBe(42);

    const objectValue = { key: 'value' };
    const { result: objectResult } = renderHook(() =>
      useInitialValue(objectValue),
    );
    expect(objectResult.current).toEqual({ key: 'value' });

    const arrayValue = [1, 2, 3];
    const { result: arrayResult } = renderHook(() =>
      useInitialValue(arrayValue),
    );
    expect(arrayResult.current).toEqual([1, 2, 3]);
  });
});
