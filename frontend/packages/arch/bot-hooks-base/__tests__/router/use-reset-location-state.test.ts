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

import { useLocation } from 'react-router-dom';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import {
  useResetLocationState,
  resetAuthLoginDataFromRoute,
} from '../../src/router/use-reset-location-state';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
}));

describe('use-reset-location-state', () => {
  const mockLocation = {
    state: { someState: 'test' },
    key: 'default',
    pathname: '/',
    search: '',
    hash: '',
  };

  const mockReplaceState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useLocation
    vi.mocked(useLocation).mockReturnValue(mockLocation);

    // Mock window.history
    Object.defineProperty(window, 'history', {
      value: {
        replaceState: mockReplaceState,
      },
      writable: true,
    });
  });

  describe('resetAuthLoginDataFromRoute', () => {
    it('should call history.replaceState with empty state', () => {
      resetAuthLoginDataFromRoute();

      expect(mockReplaceState).toHaveBeenCalledWith({}, '');
    });
  });

  describe('useResetLocationState', () => {
    it('should clear location state and auth login data', () => {
      const { result } = renderHook(() => useResetLocationState());

      // Call the reset function
      result.current();

      // Verify location state is cleared
      expect(mockLocation.state).toEqual({});

      // Verify history state is cleared
      expect(mockReplaceState).toHaveBeenCalledWith({}, '');
    });

    it('should handle undefined location state', () => {
      const mockLocationWithoutState = {} as any;
      vi.mocked(useLocation).mockReturnValue(mockLocationWithoutState);

      const { result } = renderHook(() => useResetLocationState());

      // Call the reset function
      result.current();

      // Verify location state is set to empty object
      expect(mockLocationWithoutState.state).toEqual({});

      // Verify history state is cleared
      expect(mockReplaceState).toHaveBeenCalledWith({}, '');
    });

    it('should preserve location reference while clearing state', () => {
      const { result } = renderHook(() => useResetLocationState());

      const originalLocation = mockLocation;

      // Call the reset function
      result.current();

      // Verify location reference is preserved
      expect(mockLocation).toBe(originalLocation);

      // But state is cleared
      expect(mockLocation.state).toEqual({});
    });
  });
});
