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
