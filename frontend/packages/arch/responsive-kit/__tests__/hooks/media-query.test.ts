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
import { renderHook } from '@testing-library/react';

import {
  useMediaQuery,
  useCustomMediaQuery,
} from '../../src/hooks/media-query';
import {
  ScreenRange,
  SCREENS_TOKENS,
  SCREENS_TOKENS_2,
} from '../../src/constant';

describe('useCustomMediaQuery', () => {
  // Save the original window.matchMedia
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Emulate window.matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Compatible with outdated API
      removeListener: vi.fn(), // Compatible with outdated API
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    // Restore the original window.matchMedia
    window.matchMedia = originalMatchMedia;
    vi.resetAllMocks();
  });

  it('should return false when media query does not match', () => {
    // Set matchMedia to return false
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() =>
      useCustomMediaQuery({ rangeMinPx: '768px', rangeMaxPx: '1200px' }),
    );

    expect(result.current).toBe(false);
    expect(window.matchMedia).toHaveBeenCalledWith(
      '(min-width: 768px) and (max-width: 1200px)',
    );
  });

  it('should return true when media query matches', () => {
    // Set matchMedia to return true
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() =>
      useCustomMediaQuery({ rangeMinPx: '768px', rangeMaxPx: '1200px' }),
    );

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith(
      '(min-width: 768px) and (max-width: 1200px)',
    );
  });

  it('should handle only min width', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() =>
      useCustomMediaQuery({ rangeMinPx: '768px' }),
    );

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');
  });

  it('should handle only max width', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() =>
      useCustomMediaQuery({ rangeMaxPx: '1200px' }),
    );

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1200px)');
  });

  it('should update when media query changes', () => {
    // Create a simulated MediaQueryList
    const mediaQueryList = {
      matches: false,
      media: '(min-width: 768px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // Emulate window.matchMedia returns our mediaQueryList
    window.matchMedia = vi.fn().mockReturnValue(mediaQueryList);

    const { result, rerender } = renderHook(() =>
      useCustomMediaQuery({ rangeMinPx: '768px' }),
    );

    // The initial state is false
    expect(result.current).toBe(false);

    // Find the registered event handler
    const eventListenerCall = mediaQueryList.addEventListener.mock.calls[0];
    const eventType = eventListenerCall[0];
    const handler = eventListenerCall[1];

    // Confirm that the event type is'change'
    expect(eventType).toBe('change');

    // Simulate media query changes
    mediaQueryList.matches = true;
    handler();

    // Render the hook again to get the updated value
    rerender();

    // It should be true now
    expect(result.current).toBe(true);
  });
});

describe('useMediaQuery', () => {
  // Save the original window.matchMedia
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Emulate window.matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    // Restore the original window.matchMedia
    window.matchMedia = originalMatchMedia;
    vi.resetAllMocks();
  });

  it('should use correct screen tokens for min and max ranges', () => {
    renderHook(() =>
      useMediaQuery({ rangeMin: ScreenRange.MD, rangeMax: ScreenRange.LG }),
    );

    expect(window.matchMedia).toHaveBeenCalledWith(
      `(min-width: ${SCREENS_TOKENS[ScreenRange.MD]}) and (max-width: ${
        SCREENS_TOKENS[ScreenRange.LG]
      })`,
    );
  });

  it('should handle only min range', () => {
    renderHook(() => useMediaQuery({ rangeMin: ScreenRange.MD }));

    expect(window.matchMedia).toHaveBeenCalledWith(
      `(min-width: ${SCREENS_TOKENS[ScreenRange.MD]})`,
    );
  });

  it('should handle only max range', () => {
    renderHook(() => useMediaQuery({ rangeMax: ScreenRange.LG }));

    expect(window.matchMedia).toHaveBeenCalledWith(
      `(max-width: ${SCREENS_TOKENS[ScreenRange.LG]})`,
    );
  });

  it('should use tokens from SCREENS_TOKENS_2 when available', () => {
    renderHook(() => useMediaQuery({ rangeMin: ScreenRange.XL1_5 }));

    expect(window.matchMedia).toHaveBeenCalledWith(
      `(min-width: ${SCREENS_TOKENS_2[ScreenRange.XL1_5]})`,
    );
  });
});
