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

import { expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';

import { useSearch } from '../src/hooks/use-search';

const sleep = (t: number) => new Promise(resolve => setTimeout(resolve, t));
const getSearch = (delay: number) =>
  vi.fn(async (str: string): Promise<string> => {
    await sleep(delay);
    return str;
  });

const config = {
  searchWait: 40,
  debounce: { debounceInterval: 20 },
};

describe('search', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('run once input', async () => {
    const search = getSearch(config.searchWait);
    const { result } = renderHook(() => useSearch(search, config.debounce));
    expect(result.current.searchStage).toBe('empty');
    act(() => {
      result.current.setPayload('1');
    });
    // 10ms
    await vi.advanceTimersByTimeAsync(10);
    expect(result.current.searchStage).toBe('debouncing');
    // 40ms
    await vi.advanceTimersByTimeAsync(30);
    expect(result.current.searchStage).toBe('searching');
    // 65ms
    await vi.advanceTimersByTimeAsync(25);
    expect(result.current.searchStage).toBe('success');
  });

  it('support adjust debounce time', async () => {
    const search = getSearch(config.searchWait);
    const adjustDebounce = (payload: string | null): number => {
      if (payload === '') {
        return 0;
      }
      return config.debounce.debounceInterval;
    };
    const { result } = renderHook(() =>
      useSearch(search, { ...config.debounce, adjustDebounce }),
    );
    expect(result.current.searchStage).toBe('empty');
    act(() => {
      result.current.setPayload('');
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(result.current.searchStage).toBe('searching');
  });

  it('debounce well', async () => {
    const search = getSearch(config.searchWait);
    const { result } = renderHook(() => useSearch(search, config.debounce));
    act(() => {
      result.current.setPayload('1');
    });
    expect(result.current.searchStage).toBe('debouncing');
    await vi.advanceTimersByTimeAsync(10);
    act(() => {
      result.current.setPayload('2');
    });
    expect(result.current.searchStage).toBe('debouncing');
    // 25ms
    await vi.advanceTimersByTimeAsync(25);
    expect(result.current.searchStage).toBe('searching');
    expect(search.mock.calls.length).toBe(1);
    // 65ms
    await vi.advanceTimersByTimeAsync(65);
    expect(result.current.searchStage).toBe('success');
    expect(search.mock.calls.length).toBe(1);
  });

  it('use latest result', async () => {
    const search = getSearch(config.searchWait);
    const { result } = renderHook(() => useSearch(search, config.debounce));
    act(() => {
      result.current.setPayload('1');
    });
    await vi.advanceTimersByTimeAsync(25);
    expect(result.current.searchStage).toBe('searching');
    expect(search.mock.calls.length).toBe(1);
    act(() => {
      result.current.setPayload('2');
    });
    expect(result.current.searchStage).toBe('debouncing');
    // 25ms
    await vi.advanceTimersByTimeAsync(25);
    expect(result.current.searchStage).toBe('searching');
    // 45ms
    await vi.advanceTimersByTimeAsync(20);
    expect(result.current.searchStage).toBe('searching');
    // 65ms
    await vi.advanceTimersByTimeAsync(20);
    expect(result.current.searchStage).toBe('success');
    expect(search.mock.calls.length).toBe(2);
    expect(result.current.res).toBe('2');
  });

  it('distinguishes payload between null and other falsy value', () => {
    const search = getSearch(config.searchWait);
    const { result } = renderHook(() => useSearch(search, config.debounce));
    act(() => {
      result.current.setPayload('');
    });
    expect(result.current.searchStage).toBe('debouncing');
    act(() => {
      result.current.setPayload(null);
    });
    expect(result.current.searchStage).toBe('empty');
  });

  it('goes empty immediately', async () => {
    const search = getSearch(config.searchWait);
    const { result } = renderHook(() => useSearch(search, config.debounce));
    act(() => {
      result.current.setPayload('1');
    });
    await vi.advanceTimersByTimeAsync(10);
    expect(result.current.searchStage).toBe('debouncing');
    // 30ms
    await vi.advanceTimersByTimeAsync(20);
    expect(result.current.searchStage).toBe('searching');
    act(() => {
      result.current.setPayload(null);
    });
    expect(result.current.searchStage).toBe('empty');
    // 70ms
    await vi.advanceTimersByTimeAsync(40);
    expect(result.current.searchStage).toBe('empty');
    expect(result.current.res).toBe(null);
  });

  const failSearch = async (str: string) => {
    await sleep(config.searchWait);
    throw new Error(str);
  };

  it('get error', async () => {
    const { result } = renderHook(() => useSearch(failSearch, config.debounce));
    act(() => {
      result.current.setPayload('1');
    });
    expect(result.current.searchStage).toBe('debouncing');
    await vi.advanceTimersByTimeAsync(100);
    expect(result.current.searchStage).toBe('failed');
    expect(result.current.res).toBe(null);
  });

  it('get error but cleared', async () => {
    const { result } = renderHook(() => useSearch(failSearch, config.debounce));
    act(() => {
      result.current.setPayload('1');
    });
    await vi.advanceTimersByTimeAsync(25);
    expect(result.current.searchStage).toBe('searching');
    act(() => {
      result.current.setPayload(null);
    });
    expect(result.current.searchStage).toBe('empty');
    // 75ms
    await vi.advanceTimersByTimeAsync(50);
    expect(result.current.searchStage).toBe('empty');
  });

  it('get error but covered', async () => {
    let err = 0;
    const failOnceSearch = vi.fn(async (str: string) => {
      await sleep(config.searchWait);
      if (!err++) {
        throw new Error(str);
      }
      return str;
    });
    const { result } = renderHook(() =>
      useSearch(failOnceSearch, config.debounce),
    );
    act(() => {
      result.current.setPayload('1');
    });
    await vi.advanceTimersByTimeAsync(25);
    act(() => {
      result.current.setPayload('2');
    });
    // 1: 65ms; 2: 40ms
    await vi.advanceTimersByTimeAsync(40);
    expect(failOnceSearch.mock.results[0].value).rejects.toThrowError('1');
    expect(result.current.searchStage).toBe('searching');
    // 2: 70ms
    await vi.advanceTimersByTimeAsync(30);
    expect(result.current.searchStage).toBe('success');
    expect(result.current.res).toBe('2');
  });
});
