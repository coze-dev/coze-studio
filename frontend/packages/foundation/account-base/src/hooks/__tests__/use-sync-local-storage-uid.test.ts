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

    // Initial status: not logged in
    (useLoginStatus as Mock).mockReturnValue('not_login');
    (useUserInfo as Mock).mockReturnValue(null);
    rerender();
    expect(localStorageService.setUserId).toHaveBeenCalledWith();

    // Switch to login status
    (useLoginStatus as Mock).mockReturnValue('logined');
    (useUserInfo as Mock).mockReturnValue(mockUserInfo);
    rerender();
    expect(localStorageService.setUserId).toHaveBeenCalledWith(
      mockUserInfo.user_id_str,
    );
  });
});
