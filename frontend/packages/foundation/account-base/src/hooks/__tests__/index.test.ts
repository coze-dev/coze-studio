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
import { useDocumentVisibility } from 'ahooks';
import { renderHook, act } from '@testing-library/react';

import { useLoginStatus, useAlterOnLogout } from '../index';
import { useUserStore } from '../../store/user';

// Mock ahooks
vi.mock('ahooks', async importOriginal => {
  const original = await importOriginal();
  return {
    ...original,
    useDocumentVisibility: vi.fn(),
  };
});

// Mock useUserStore
vi.mock('../../store/user', () => ({
  useUserStore: vi.fn(),
}));

const UID_KEY = 'coze_current_uid';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: (index: number) => null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
});
Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
});

describe('Account Hooks from index.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Default mock for useUserStore to return a function that can be called with a selector
    (useUserStore as unknown as Mock).mockImplementation(selector =>
      selector(mockUserState),
    );
  });

  let mockUserState: any;

  describe('useLoginStatus', () => {
    it('should return "settling" if store is not settled', () => {
      mockUserState = { isSettled: false, userInfo: null };
      const { result } = renderHook(() => useLoginStatus());
      expect(result.current).toBe('settling');
    });

    it('should return "not_login" if store is settled and no userInfo', () => {
      mockUserState = { isSettled: true, userInfo: null };
      const { result } = renderHook(() => useLoginStatus());
      expect(result.current).toBe('not_login');
    });

    it('should return "not_login" if store is settled and userInfo has no user_id_str', () => {
      mockUserState = { isSettled: true, userInfo: { name: 'Test' } };
      const { result } = renderHook(() => useLoginStatus());
      expect(result.current).toBe('not_login');
    });

    it('should return "logined" if store is settled and userInfo has user_id_str', () => {
      mockUserState = { isSettled: true, userInfo: { user_id_str: '123' } };
      const { result } = renderHook(() => useLoginStatus());
      expect(result.current).toBe('logined');
    });
  });

  describe('useAlterOnLogout', () => {
    let alertMock: Mock;

    beforeEach(() => {
      alertMock = vi.fn();
      (useDocumentVisibility as Mock).mockReturnValue('visible');
      // Mock getState for the effect cleanup function
      (useUserStore as any).getState = vi.fn(() => mockUserState);
    });

    it('should not call alert if document is visible or user is not logged in', () => {
      mockUserState = { isSettled: true, userInfo: null }; // Not logged in
      renderHook(() => useAlterOnLogout(alertMock));
      // Simulate visibility change to hidden and back to visible (triggering cleanup and re-run)
      act(() => {
        (useDocumentVisibility as Mock).mockReturnValue('hidden');
      });
      act(() => {
        (useDocumentVisibility as Mock).mockReturnValue('visible');
      });
      expect(alertMock).not.toHaveBeenCalled();
    });

    it('should call alert if user was logged in, document becomes visible, and UID in localStorage is different or null', () => {
      const currentUserId = 'user123';
      mockUserState = {
        isSettled: true,
        userInfo: { user_id_str: currentUserId },
      }; // Logged in
      localStorageMock.setItem(UID_KEY, currentUserId); // UID in localStorage matches

      (useDocumentVisibility as Mock).mockReturnValue('hidden'); // Start hidden
      const { rerender } = renderHook(() => useAlterOnLogout(alertMock));

      // Simulate user logging out in another tab (localStorage UID changes)
      localStorageMock.removeItem(UID_KEY);

      // Simulate tab becoming visible
      act(() => {
        (useDocumentVisibility as Mock).mockReturnValue('visible');
      });
      rerender(); // Rerender to trigger useEffect with new visibility

      expect(alertMock).toHaveBeenCalledTimes(1);
    });

    it('should call alert if user was logged in, document becomes visible, and UID in localStorage is different', () => {
      const currentUserId = 'user123';
      const otherTabUserId = 'user456';
      mockUserState = {
        isSettled: true,
        userInfo: { user_id_str: currentUserId },
      }; // Logged in
      localStorageMock.setItem(UID_KEY, currentUserId); // UID in localStorage matches

      (useDocumentVisibility as Mock).mockReturnValue('hidden'); // Start hidden
      const { rerender } = renderHook(() => useAlterOnLogout(alertMock));

      localStorageMock.setItem(UID_KEY, otherTabUserId); // UID changes in another tab

      act(() => {
        (useDocumentVisibility as Mock).mockReturnValue('visible');
      });
      rerender();

      expect(alertMock).toHaveBeenCalledTimes(1);
    });

    it('should NOT call alert if user was logged in, document becomes visible, and UID in localStorage matches', () => {
      const currentUserId = 'user123';
      mockUserState = {
        isSettled: true,
        userInfo: { user_id_str: currentUserId },
      }; // Logged in
      localStorageMock.setItem(UID_KEY, currentUserId);

      (useDocumentVisibility as Mock).mockReturnValue('hidden');
      const { rerender } = renderHook(() => useAlterOnLogout(alertMock));

      act(() => {
        (useDocumentVisibility as Mock).mockReturnValue('visible');
      });
      rerender();

      expect(alertMock).not.toHaveBeenCalled();
    });
  });
});
