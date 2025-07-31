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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useLineClamp } from '../src/use-line-clamp';

describe('useLineClamp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return contentRef and isClamped', () => {
    const { result } = renderHook(() => useLineClamp());

    expect(result.current.contentRef).toBeDefined();
    expect(result.current.isClamped).toBe(false);
  });

  it('should add and remove resize event listener', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useLineClamp());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
  });

  it('should update isClamped when content height changes', () => {
    const mockDiv = document.createElement('div');
    Object.defineProperties(mockDiv, {
      scrollHeight: {
        configurable: true,
        get: () => 100,
      },
      clientHeight: {
        configurable: true,
        get: () => 50,
      },
    });

    const { result } = renderHook(() => useLineClamp());

    // Use vi.spyOn to simulate contentRef.current
    vi.spyOn(result.current.contentRef, 'current', 'get').mockReturnValue(
      mockDiv,
    );

    // Wrap asynchronous operations with act
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isClamped).toBe(true);
  });

  it('should handle null contentRef', () => {
    const { result } = renderHook(() => useLineClamp());

    // Use vi.spyOn to simulate contentRef. current is null
    vi.spyOn(result.current.contentRef, 'current', 'get').mockReturnValue(null);

    // Wrap asynchronous operations with act
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isClamped).toBe(false);
  });
});
