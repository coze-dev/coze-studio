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
import {
  refreshUserInfo,
  logout,
  checkLoginImpl,
  checkLogin,
  connector2Redirect,
} from '../index';
import {
  refreshUserInfoBase,
  logoutBase,
  checkLoginBase,
} from '@coze-foundation/account-base';
import { passportApi } from '../../passport-api';

// Mock dependencies
vi.mock('@coze-foundation/account-base', () => ({
  refreshUserInfoBase: vi.fn(),
  logoutBase: vi.fn(),
  checkLoginBase: vi.fn(),
}));

vi.mock('../../passport-api', () => ({
  passportApi: {
    checkLogin: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('utils/index.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('refreshUserInfo', () => {
    it('should call refreshUserInfoBase with passportApi.checkLogin', () => {
      refreshUserInfo();
      expect(refreshUserInfoBase).toHaveBeenCalledWith(passportApi.checkLogin);
    });
  });

  describe('logout', () => {
    it('should call logoutBase with passportApi.logout', () => {
      logout();
      expect(logoutBase).toHaveBeenCalledWith(passportApi.logout);
    });
  });

  describe('checkLoginImpl', () => {
    it('should return userInfo when passportApi.checkLogin succeeds', async () => {
      const mockUserInfo = { id: '123', name: 'test' };
      vi.mocked(passportApi.checkLogin).mockResolvedValue(mockUserInfo);

      const result = await checkLoginImpl();
      expect(result).toEqual({ userInfo: mockUserInfo });
    });

    it('should return undefined userInfo when passportApi.checkLogin fails', async () => {
      vi.mocked(passportApi.checkLogin).mockRejectedValue(
        new Error('API error'),
      );

      const result = await checkLoginImpl();
      expect(result).toEqual({ userInfo: undefined });
    });
  });

  describe('checkLogin', () => {
    it('should call checkLoginBase with checkLoginImpl', () => {
      checkLogin();
      expect(checkLoginBase).toHaveBeenCalledWith(checkLoginImpl);
    });
  });

  describe('connector2Redirect', () => {
    it('should return undefined (open source version)', () => {
      const result = connector2Redirect();
      expect(result).toBeUndefined();
    });
  });
});
