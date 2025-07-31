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
