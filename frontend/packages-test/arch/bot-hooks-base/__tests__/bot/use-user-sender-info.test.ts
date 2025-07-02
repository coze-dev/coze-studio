import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  userStoreService,
  type UserInfo,
  type UserLabel,
} from '@coze-studio/user-store';

import { useUserSenderInfo } from '../../src/bot/use-user-sender-info';

// Mock dependencies
vi.mock('@coze-studio/user-store', () => ({
  userStoreService: {
    useUserLabel: vi.fn(),
    useUserInfo: vi.fn(),
  },
}));

describe('useUserSenderInfo', () => {
  const mockUserLabel = {
    id: 'label-1',
    name: 'Test Label',
  } as unknown as UserLabel;
  const mockUserInfo: Partial<UserInfo> = {
    avatar_url: 'https://example.com/avatar.jpg',
    name: 'Test User',
    user_id_str: '12345',
    app_user_info: {
      user_unique_name: 'test_user',
    },
  };

  it('should return null when userInfo is not available', () => {
    vi.mocked(userStoreService.useUserLabel).mockReturnValue(mockUserLabel);
    vi.mocked(userStoreService.useUserInfo).mockReturnValue(null);

    const { result } = renderHook(() => useUserSenderInfo());

    expect(result.current).toBeNull();
  });

  it('should return formatted user sender info when userInfo is available', () => {
    vi.mocked(userStoreService.useUserLabel).mockReturnValue(mockUserLabel);
    vi.mocked(userStoreService.useUserInfo).mockReturnValue(
      mockUserInfo as UserInfo,
    );

    const { result } = renderHook(() => useUserSenderInfo());

    expect(result.current).toEqual({
      url: mockUserInfo.avatar_url,
      nickname: mockUserInfo.name,
      id: mockUserInfo.user_id_str,
      userUniqueName: mockUserInfo.app_user_info?.user_unique_name,
      userLabel: mockUserLabel,
    });
  });

  it('should handle missing optional fields', () => {
    const partialUserInfo: Partial<UserInfo> = {
      user_id_str: '12345',
      app_user_info: {},
    };

    vi.mocked(userStoreService.useUserLabel).mockReturnValue(mockUserLabel);
    vi.mocked(userStoreService.useUserInfo).mockReturnValue(
      partialUserInfo as UserInfo,
    );

    const { result } = renderHook(() => useUserSenderInfo());

    expect(result.current).toEqual({
      url: '',
      nickname: '',
      id: partialUserInfo.user_id_str,
      userUniqueName: '',
      userLabel: mockUserLabel,
    });
  });
});
