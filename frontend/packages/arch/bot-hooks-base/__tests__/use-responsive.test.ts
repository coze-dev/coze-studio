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
import { renderHook } from '@testing-library/react';
import { ScreenRange, useMediaQuery } from '@coze-arch/responsive-kit';

import { useIsResponsiveByRouteConfig } from '../src/use-responsive';

// Mock dependencies
vi.mock('@coze-arch/responsive-kit', () => ({
  useMediaQuery: vi.fn(),
  ScreenRange: {
    LG: 'lg',
    MD: 'md',
  },
}));

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
}));

vi.mock('../src/use-route-config', () => ({
  useRouteConfig: vi.fn(),
}));

import { useRouteConfig } from '../src/use-route-config';

describe('useIsResponsiveByRouteConfig', () => {
  it('should handle responsive=true case', () => {
    (useRouteConfig as any).mockReturnValue({ responsive: true });
    (useMediaQuery as any).mockReturnValue(false);

    const { result } = renderHook(() => useIsResponsiveByRouteConfig());
    expect(result.current).toBe(true);
  });

  it('should handle custom responsive config with include=true', () => {
    (useRouteConfig as any).mockReturnValue({
      responsive: {
        rangeMax: ScreenRange.LG,
        include: true,
      },
    });
    (useMediaQuery as any).mockReturnValue(true);

    const { result } = renderHook(() => useIsResponsiveByRouteConfig());
    expect(result.current).toBe(true);
  });

  it('should handle custom responsive config with include=false', () => {
    (useRouteConfig as any).mockReturnValue({
      responsive: {
        rangeMax: ScreenRange.LG,
        include: false,
      },
    });
    (useMediaQuery as any).mockReturnValue(false);

    const { result } = renderHook(() => useIsResponsiveByRouteConfig());
    expect(result.current).toBe(true);
  });

  it('should return false when responsive is undefined', () => {
    (useRouteConfig as any).mockReturnValue({});
    (useMediaQuery as any).mockReturnValue(true);

    const { result } = renderHook(() => useIsResponsiveByRouteConfig());
    expect(result.current).toBe(false);
  });
});
