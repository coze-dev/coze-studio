import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useLoggedIn } from '../src/use-loggedin';

// Mock userStoreService
vi.mock('@coze-studio/user-store', () => ({
  userStoreService: {
    useIsLogined: vi.fn(),
  },
}));

import { userStoreService } from '@coze-studio/user-store';

describe('useLoggedIn', () => {
  it('should return true when user is logged in', () => {
    (userStoreService.useIsLogined as any).mockReturnValue(true);
    const { result } = renderHook(() => useLoggedIn());
    expect(result.current).toBe(true);
  });

  it('should return false when user is not logged in', () => {
    (userStoreService.useIsLogined as any).mockReturnValue(false);
    const { result } = renderHook(() => useLoggedIn());
    expect(result.current).toBe(false);
  });

  it('should call userStoreService.useIsLogined', () => {
    renderHook(() => useLoggedIn());
    expect(userStoreService.useIsLogined).toHaveBeenCalled();
  });
});
