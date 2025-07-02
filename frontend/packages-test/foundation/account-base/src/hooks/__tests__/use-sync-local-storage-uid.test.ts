import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { localStorageService } from '@coze-foundation/local-storage';

import { useSyncLocalStorageUid } from '../use-sync-local-storage-uid';
import { useLoginStatus, useUserInfo } from '../index';

// Mock hooks and services
vi.mock('../index', () => ({
  useLoginStatus: vi.fn(),
  useUserInfo: vi.fn(),
}));

vi.mock('@coze-foundation/local-storage', () => ({
  localStorageService: {
    setUserId: vi.fn(),
  },
}));

describe('useSyncLocalStorageUid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('update uid when login status changes', () => {
    const mockUserInfo = { user_id_str: '123456' };
    const { rerender } = renderHook(() => useSyncLocalStorageUid(), {
      initialProps: {},
    });

    // 初始状态：未登录
    (useLoginStatus as Mock).mockReturnValue('not_login');
    (useUserInfo as Mock).mockReturnValue(null);
    rerender();
    expect(localStorageService.setUserId).toHaveBeenCalledWith();

    // 切换到登录状态
    (useLoginStatus as Mock).mockReturnValue('logined');
    (useUserInfo as Mock).mockReturnValue(mockUserInfo);
    rerender();
    expect(localStorageService.setUserId).toHaveBeenCalledWith(
      mockUserInfo.user_id_str,
    );
  });
});
