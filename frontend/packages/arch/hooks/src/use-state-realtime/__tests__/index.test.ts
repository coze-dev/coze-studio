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

/* eslint-disable @typescript-eslint/no-unused-vars */
import { act, renderHook } from '@testing-library/react-hooks';
import useStateRealtime from '../index';

describe('useStateRealtime', () => {
  it('initState undefined', () => {
    const { result } = renderHook(() => useStateRealtime());
    const [state, setState, getRealVal] = result.current;
    expect(state).toBeUndefined();
  });
  it('initState number 2', () => {
    const { result } = renderHook(() => useStateRealtime(2));
    const [state, setState, getRealVal] = result.current;
    expect(state).toBe(2);
  });
  it('initState function 10', () => {
    const { result } = renderHook(() => useStateRealtime(() => 10));
    const [state, setState, getRealVal] = result.current;
    expect(state).toBe(10);
  });
  it('method setState', () => {
    const { result } = renderHook(() => useStateRealtime(1));
    const [state, setState, getRealVal] = result.current;
    expect(result.current[0]).toBe(1);
    act(() => {
      setState(2);
    });
    expect(result.current[0]).toBe(2);
  });
  it('method setState param function', () => {
    const { result } = renderHook(() => useStateRealtime(() => 10));
    const [state, setState, getRealVal] = result.current;
    expect(result.current[0]).toBe(10);
    act(() => {
      setState(pre => pre + 2);
    });
    expect(result.current[0]).toBe(12);
  });
  it('method getRealVal', () => {
    const { result } = renderHook(() => useStateRealtime(1));
    const [state, setState, getRealVal] = result.current;
    act(() => {
      setState(2);
    });
    expect(getRealVal()).toBe(2);
  });
  it('method getRealVal function', () => {
    const { result } = renderHook(() => useStateRealtime(() => 10));
    const [state, setState, getRealVal] = result.current;
    act(() => {
      setState(pre => pre + 2);
    });
    expect(getRealVal()).toBe(12);
  });
  it('test batchUpdate', () => {
    const { result } = renderHook(() => useStateRealtime(1));
    const [state, setState, getRealVal] = result.current;
    act(() => {
      setState(pre => pre + 2);
      expect(getRealVal()).toBe(3);
      setState(pre => pre + 2);
      expect(getRealVal()).toBe(5);
    });
    expect(result.current[0]).toBe(5);
    expect(getRealVal()).toBe(5);
    act(() => {
      setState(pre => pre + 4);
      expect(getRealVal()).toBe(9);
      setState(pre => pre + 4);
      expect(getRealVal()).toBe(13);
    });
    expect(result.current[0]).toBe(13);
    expect(getRealVal()).toBe(13);
  });
});
