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
