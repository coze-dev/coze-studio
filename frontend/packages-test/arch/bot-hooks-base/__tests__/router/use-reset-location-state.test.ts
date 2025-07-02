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
