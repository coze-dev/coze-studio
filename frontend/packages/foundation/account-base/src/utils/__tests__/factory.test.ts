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

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { setUserInfoContext } from '@coze-arch/logger';

import { refreshUserInfoBase, logoutBase, checkLoginBase } from '../factory';
import { type UserInfo } from '../../types';
import { useUserStore } from '../../store/user';

// Mock dependencies
vi.mock('@coze-arch/logger', () => ({
  setUserInfoContext: vi.fn(),
}));

vi.mock('../../store/user', () => ({
  useUserStore: {
    getState: vi.fn(),
    setState: vi.fn(),
  },
}));

describe('factory.ts utility functions', () => {
  let mockGetState: Mock;
  let mockSetState: Mock;
  let mockSetUserInfo: Mock;
  let mockReset: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetUserInfo = vi.fn();
    mockReset = vi.fn();
    mockGetState = useUserStore.getState as Mock;
    mockSetState = useUserStore.setState as Mock;
    mockGetState.mockReturnValue({
      setUserInfo: mockSetUserInfo,
      reset: mockReset,
    });
  });

  describe('refreshUserInfoBase', () => {
    it('should correctly refresh user information', async () => {
      const mockUserInfo = {
        user_id_str: '123',
        name: 'Test User',
      } as UserInfo;
      const mockCheckLogin = vi.fn().mockResolvedValue(mockUserInfo);

      await refreshUserInfoBase(mockCheckLogin);

      expect(mockSetState).toHaveBeenCalledWith({ hasError: false });
      expect(mockCheckLogin).toHaveBeenCalled();
      expect(mockSetUserInfo).toHaveBeenCalledWith(mockUserInfo);
    });
  });

  describe('logoutBase', () => {
    it('should correctly execute logout operation', async () => {
      const mockLogout = vi.fn().mockResolvedValue(undefined);

      await logoutBase(mockLogout);

      expect(mockLogout).toHaveBeenCalled();
      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('checkLoginBase', () => {
    const mockSetUserInfoContext = setUserInfoContext as Mock;

    it('should correctly handle successful login state', async () => {
      const mockUserInfo = {
        user_id_str: '123',
        name: 'Test User',
      } as UserInfo;
      const mockCheckLoginImpl = vi
        .fn()
        .mockResolvedValue({ userInfo: mockUserInfo });

      await checkLoginBase(mockCheckLoginImpl);

      expect(mockSetState).toHaveBeenCalledWith({ hasError: false });
      expect(mockSetUserInfoContext).toHaveBeenCalledWith(mockUserInfo);
      expect(mockSetState).toHaveBeenCalledWith({
        userInfo: mockUserInfo,
        isSettled: true,
      });
    });

    it('should correctly handle login error state', async () => {
      const mockCheckLoginImpl = vi.fn().mockResolvedValue({ hasError: true });

      await checkLoginBase(mockCheckLoginImpl);

      expect(mockSetState).toHaveBeenCalledWith({ hasError: false });
      expect(mockSetState).toHaveBeenCalledWith({ hasError: true });
      expect(mockSetUserInfoContext).not.toHaveBeenCalled();
    });

    it('should correctly handle not logged in state', async () => {
      const mockCheckLoginImpl = vi.fn().mockResolvedValue({ userInfo: null });

      await checkLoginBase(mockCheckLoginImpl);

      expect(mockSetState).toHaveBeenCalledWith({ hasError: false });
      expect(mockSetState).toHaveBeenCalledWith({
        userInfo: null,
        isSettled: true,
      });
      expect(mockSetUserInfoContext).not.toHaveBeenCalled();
    });
  });
});
