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
import { I18n } from '@coze-arch/i18n';

import {
  getUserInfo,
  getLoginStatus,
  resetUserStore,
  setUserInfo,
  getUserLabel,
  getUserAuthInfos,
  subscribeUserAuthInfos,
  usernameRegExpValidate,
} from '../index';
import { useUserStore } from '../../store/user';

// Mock useUserStore
vi.mock('../../store/user', () => ({
  useUserStore: {
    getState: vi.fn(),
    setState: vi.fn(), // Though not directly used by all utils, good to have for setUserInfo
    subscribe: vi.fn(),
  },
}));

// Mock I18n
vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(key => key), // Simple mock that returns the key
  },
}));

describe('Utility functions from utils/index.ts', () => {
  let mockGetState: Mock;
  let mockSubscribe: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetState = useUserStore.getState as Mock;
    mockSubscribe = useUserStore.subscribe as Mock;
  });

  describe('getUserInfo', () => {
    it('should return userInfo from userStore.getState()', () => {
      const mockUser = { user_id_str: 'testUser', name: 'Test User' };
      mockGetState.mockReturnValue({ userInfo: mockUser });
      expect(getUserInfo()).toEqual(mockUser);
      expect(mockGetState).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLoginStatus', () => {
    it('should return "settling" if store is not settled', () => {
      mockGetState.mockReturnValue({ isSettled: false, userInfo: null });
      expect(getLoginStatus()).toBe('settling');
    });

    it('should return "not_login" if store is settled and no userInfo', () => {
      mockGetState.mockReturnValue({ isSettled: true, userInfo: null });
      expect(getLoginStatus()).toBe('not_login');
    });

    it('should return "not_login" if store is settled and userInfo has no user_id_str', () => {
      mockGetState.mockReturnValue({
        isSettled: true,
        userInfo: { name: 'Test' },
      });
      expect(getLoginStatus()).toBe('not_login');
    });

    it('should return "logined" if store is settled and userInfo has user_id_str', () => {
      mockGetState.mockReturnValue({
        isSettled: true,
        userInfo: { user_id_str: '123' },
      });
      expect(getLoginStatus()).toBe('logined');
    });
  });

  describe('resetUserStore', () => {
    it('should call reset on userStore.getState()', () => {
      const mockReset = vi.fn();
      mockGetState.mockReturnValue({ reset: mockReset });
      resetUserStore();
      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('setUserInfo', () => {
    it('should call setUserInfo on userStore.getState() with the provided user info', () => {
      const mockSetUserInfo = vi.fn();
      mockGetState.mockReturnValue({ setUserInfo: mockSetUserInfo });
      const newUser = { user_id_str: 'newUser', name: 'New User' };
      setUserInfo(newUser);
      expect(mockSetUserInfo).toHaveBeenCalledWith(newUser);
    });

    it('should call setUserInfo on userStore.getState() with null', () => {
      const mockSetUserInfo = vi.fn();
      mockGetState.mockReturnValue({ setUserInfo: mockSetUserInfo });
      setUserInfo(null);
      expect(mockSetUserInfo).toHaveBeenCalledWith(null);
    });
  });

  describe('getUserLabel', () => {
    it('should return userLabel from userStore.getState()', () => {
      const mockLabel = { label_type: 1, text: 'VIP' };
      mockGetState.mockReturnValue({ userLabel: mockLabel });
      expect(getUserLabel()).toEqual(mockLabel);
      expect(mockGetState).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserAuthInfos', () => {
    it('should call getUserAuthInfos on userStore.getState()', async () => {
      const mockGetUserAuthInfos = vi.fn().mockResolvedValue([]);
      mockGetState.mockReturnValue({ getUserAuthInfos: mockGetUserAuthInfos });
      await getUserAuthInfos();
      expect(mockGetUserAuthInfos).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribeUserAuthInfos', () => {
    it('should call userStore.subscribe with a selector for userAuthInfos and the callback', () => {
      const callback = vi.fn();
      const mockUserAuthInfos = [
        { auth_type: 'email', auth_key: 'test@example.com' },
      ];
      // Mock the subscribe implementation to immediately call the listener with selected state
      mockSubscribe.mockImplementation(
        (selector, cb) => vi.fn(), // Return unsubscribe function
      );

      subscribeUserAuthInfos(callback);

      expect(mockSubscribe).toHaveBeenCalledTimes(1);
      // Check that the selector passed to subscribe correctly extracts userAuthInfos
      const selectorArg = mockSubscribe.mock.calls[0][0];
      expect(selectorArg({ userAuthInfos: mockUserAuthInfos })).toEqual(
        mockUserAuthInfos,
      );
      expect(mockSubscribe.mock.calls[0][1]).toBe(callback);
    });
  });

  describe('usernameRegExpValidate', () => {
    it('should return null for valid usernames', () => {
      expect(usernameRegExpValidate('validUser123')).toBeNull();
      expect(usernameRegExpValidate('another_valid_user')).toBeNull();
      expect(usernameRegExpValidate('USER')).toBeNull();
      expect(usernameRegExpValidate('1234')).toBeNull();
    });

    it('should return "username_invalid_letter" for usernames with invalid characters', () => {
      (I18n.t as Mock).mockReturnValueOnce('username_invalid_letter');
      expect(usernameRegExpValidate('invalid-char')).toBe(
        'username_invalid_letter',
      );
      (I18n.t as Mock).mockReturnValueOnce('username_invalid_letter');
      expect(usernameRegExpValidate('invalid char')).toBe(
        'username_invalid_letter',
      );
      (I18n.t as Mock).mockReturnValueOnce('username_invalid_letter');
      expect(usernameRegExpValidate('!@#$%^')).toBe('username_invalid_letter');
      expect(I18n.t).toHaveBeenCalledWith('username_invalid_letter');
    });

    it('should return "username_too_short" for usernames shorter than minLength (4)', () => {
      (I18n.t as Mock).mockReturnValueOnce('username_too_short');
      expect(usernameRegExpValidate('abc')).toBe('username_too_short');
      (I18n.t as Mock).mockReturnValueOnce('username_too_short');
      expect(usernameRegExpValidate('us')).toBe('username_too_short');
      expect(I18n.t).toHaveBeenCalledWith('username_too_short');
    });

    it('should return "username_invalid_letter" if invalid char before checking length', () => {
      // This case tests if the invalid character check takes precedence
      (I18n.t as Mock).mockReturnValueOnce('username_invalid_letter');
      expect(usernameRegExpValidate('a-b')).toBe('username_invalid_letter'); // Length 3, but invalid char
      expect(I18n.t).toHaveBeenCalledWith('username_invalid_letter');
    });
  });
});
