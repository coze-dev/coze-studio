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
  // 保存原始的 window.matchMedia
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // 模拟 window.matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // 兼容旧版API
      removeListener: vi.fn(), // 兼容旧版API
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    // 恢复原始的 window.matchMedia
    window.matchMedia = originalMatchMedia;
    vi.resetAllMocks();
  });

  it('should return false when media query does not match', () => {
    // 设置 matchMedia 返回 false
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
    // 设置 matchMedia 返回 true
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
    // 创建一个模拟的 MediaQueryList
    const mediaQueryList = {
      matches: false,
      media: '(min-width: 768px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // 模拟 window.matchMedia 返回我们的 mediaQueryList
    window.matchMedia = vi.fn().mockReturnValue(mediaQueryList);

    const { result, rerender } = renderHook(() =>
      useCustomMediaQuery({ rangeMinPx: '768px' }),
    );

    // 初始状态是 false
    expect(result.current).toBe(false);

    // 找到注册的事件处理函数
    const eventListenerCall = mediaQueryList.addEventListener.mock.calls[0];
    const eventType = eventListenerCall[0];
    const handler = eventListenerCall[1];

    // 确认事件类型是 'change'
    expect(eventType).toBe('change');

    // 模拟媒体查询变化
    mediaQueryList.matches = true;
    handler();

    // 重新渲染钩子以获取更新后的值
    rerender();

    // 现在应该是 true
    expect(result.current).toBe(true);
  });
});

describe('useMediaQuery', () => {
  // 保存原始的 window.matchMedia
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // 模拟 window.matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    // 恢复原始的 window.matchMedia
    window.matchMedia = originalMatchMedia;
    vi.resetAllMocks();
  });

  it('should use correct screen tokens for min and max ranges', () => {
    renderHook(() =>
      useMediaQuery({ rangeMin: ScreenRange.MD, rangeMax: ScreenRange.LG }),
    );

    expect(window.matchMedia).toHaveBeenCalledWith(
      `(min-width: ${SCREENS_TOKENS[ScreenRange.MD]}) and (max-width: ${SCREENS_TOKENS[ScreenRange.LG]})`,
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
