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

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { passport } from '@coze-studio/api-schema';
import { passportApi } from '../index';

// Simulated passport API
vi.mock('@coze-studio/api-schema/passport', () => ({}));
vi.mock('@coze-studio/api-schema', () => ({
  passport: {
    PassportAccountInfoV2: vi.fn(),
    PassportWebLogoutGet: vi.fn(),
    UserUpdateAvatar: vi.fn(),
    PassportWebEmailPasswordResetGet: vi.fn(),
    UserUpdateProfile: vi.fn(),
  },
}));
vi.mock('@coze-foundation/account-base', () => ({
  resetUserStore: vi.fn(),
}));

describe('passportApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkLogin', () => {
    it('should correctly return user information', async () => {
      const mockUserInfo = { name: 'test' };
      vi.mocked(passport.PassportAccountInfoV2).mockResolvedValueOnce({
        data: mockUserInfo,
      });

      const result = await passportApi.checkLogin();
      expect(result).toEqual(mockUserInfo);
      expect(passport.PassportAccountInfoV2).toHaveBeenCalledWith({});
    });
  });

  describe('logout', () => {
    it('should correctly call the logout API', async () => {
      await passportApi.logout();
      expect(passport.PassportWebLogoutGet).toHaveBeenCalledWith({
        next: '/',
      });
    });
  });

  describe('uploadAvatar', () => {
    it('should correctly upload avatar', async () => {
      const mockFile = new File([''], 'test.png');
      const mockResponse = { data: { url: 'test-url' } };
      vi.mocked(passport.UserUpdateAvatar).mockResolvedValueOnce(mockResponse);

      const result = await passportApi.uploadAvatar({ avatar: mockFile });
      expect(result).toEqual(mockResponse.data);
      expect(passport.UserUpdateAvatar).toHaveBeenCalledWith({
        avatar: mockFile,
      });
    });
  });

  describe('updatePassword', () => {
    it('should correctly call the password reset API', async () => {
      const params = { password: 'newpass', email: 'test@example.com' };
      await passportApi.updatePassword(params);
      expect(passport.PassportWebEmailPasswordResetGet).toHaveBeenCalledWith({
        ...params,
        code: '',
      });
    });
  });

  describe('updateUserProfile', () => {
    it('should correctly update user profile', async () => {
      const mockProfile = { nickname: 'newname' };
      await passportApi.updateUserProfile(mockProfile);
      expect(passport.UserUpdateProfile).toHaveBeenCalledWith(mockProfile);
    });
  });
});
