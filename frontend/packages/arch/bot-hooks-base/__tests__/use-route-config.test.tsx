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

import { describe, it, expect, vi, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ScreenRange } from '@coze-arch/responsive-kit';

import { useRouteConfig } from '../src/use-route-config';

// Mock useMatches hook
vi.mock('react-router-dom', () => ({
  useMatches: vi.fn(),
}));

import { useMatches } from 'react-router-dom';

describe('useRouteConfig', () => {
  it('should return default config when no matches', () => {
    const mockUseMatches = useMatches as Mock;
    mockUseMatches.mockReturnValue([]);

    const defaults = {
      hasSider: true,
      showMobileTips: false,
    };

    const { result } = renderHook(() => useRouteConfig(defaults));

    expect(result.current).toEqual(defaults);
  });

  it('should merge configs from matched routes', () => {
    const mockUseMatches = useMatches as Mock;
    mockUseMatches.mockReturnValue([
      {
        handle: {
          hasSider: true,
          showMobileTips: false,
        },
      },
      {
        handle: {
          showMobileTips: true,
          requireAuth: true,
        },
      },
    ]);

    const defaults = {
      hasSider: false,
      showAssistant: true,
    };

    const { result } = renderHook(() => useRouteConfig(defaults));

    expect(result.current).toEqual({
      hasSider: true,
      showMobileTips: true,
      requireAuth: true,
      showAssistant: true,
    });
  });

  it('should handle responsive config', () => {
    const mockUseMatches = useMatches as Mock;
    mockUseMatches.mockReturnValue([
      {
        handle: {
          responsive: {
            rangeMax: ScreenRange.LG,
            include: false,
          },
        },
      },
    ]);

    const { result } = renderHook(() => useRouteConfig());

    expect(result.current).toEqual({
      responsive: {
        rangeMax: ScreenRange.LG,
        include: false,
      },
    });
  });

  it('should handle empty defaults', () => {
    const mockUseMatches = useMatches as Mock;
    mockUseMatches.mockReturnValue([]);

    const { result } = renderHook(() => useRouteConfig());

    expect(result.current).toEqual({});
  });
});
