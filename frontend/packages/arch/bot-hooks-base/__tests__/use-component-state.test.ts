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
import { renderHook, act } from '@testing-library/react';

import { useComponentState } from '../src/use-component-state';

describe('useComponentState', () => {
  it('should initialize with the provided state', () => {
    const initialState = { count: 0, text: 'hello' };
    const { result } = renderHook(() => useComponentState(initialState));

    expect(result.current.state).toEqual(initialState);
  });

  it('should perform incremental updates by default', () => {
    const initialState = { count: 0, text: 'hello' };
    const { result } = renderHook(() => useComponentState(initialState));

    act(() => {
      result.current.setState({ count: 1 });
    });

    expect(result.current.state).toEqual({ count: 1, text: 'hello' });
  });

  it('should replace entire state when replace flag is true', () => {
    const initialState = { count: 0, text: 'hello', extra: true };
    const { result } = renderHook(() => useComponentState(initialState));

    act(() => {
      result.current.setState({ count: 1, text: 'hello', extra: true }, true);
    });

    expect(result.current.state).toEqual({
      count: 1,
      text: 'hello',
      extra: true,
    });
  });

  it('should reset state to initial value', () => {
    const initialState = { count: 0, text: 'hello' };
    const { result } = renderHook(() => useComponentState(initialState));

    act(() => {
      result.current.setState({ count: 1, text: 'world' });
    });

    expect(result.current.state).toEqual({ count: 1, text: 'world' });

    act(() => {
      result.current.resetState();
    });

    expect(result.current.state).toEqual(initialState);
  });

  it('should handle multiple updates', () => {
    const initialState = { count: 0, text: 'hello' };
    const { result } = renderHook(() => useComponentState(initialState));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.setState({ text: 'world' });
    });

    expect(result.current.state).toEqual({ count: 1, text: 'world' });
  });
});
