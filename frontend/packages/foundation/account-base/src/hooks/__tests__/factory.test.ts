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

import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  handleAPIErrorEvent,
  removeAPIErrorEvent,
  APIErrorEvent,
} from '@coze-arch/bot-api';

import { useCheckLoginBase } from '../factory';
import { useUserStore } from '../../store/user';

vi.mock('@coze-arch/bot-api', () => ({
  handleAPIErrorEvent: vi.fn(),
  removeAPIErrorEvent: vi.fn(),
  APIErrorEvent: { UNAUTHORIZED: 'UNAUTHORIZED' },
}));

const mockCheckLoginImpl = vi
  .fn()
  .mockResolvedValue({ userInfo: null, hasError: false });
const mockGoLogin = vi.fn();
const mockReset = vi.fn();
const originalUserStore = {
  ...useUserStore.getState(),
  reset: mockReset,
};

beforeEach(() => {
  useUserStore.setState(originalUserStore);
  vi.clearAllMocks();
  mockGoLogin.mockReset();
});

describe('useCheckLoginBase', () => {
  it('should call checkLoginBase when isSettled is false', () => {
    useUserStore.setState({ isSettled: false });
    renderHook(() => useCheckLoginBase(true, mockCheckLoginImpl, mockGoLogin));
    expect(mockCheckLoginImpl).toHaveBeenCalledTimes(1);
  });
  it('should call checkLoginBase when isSettled is false and require auth is false', () => {
    useUserStore.setState({ isSettled: false });
    renderHook(() => useCheckLoginBase(false, mockCheckLoginImpl, mockGoLogin));
    expect(mockCheckLoginImpl).toHaveBeenCalledTimes(1);
  });

  it('should redirect to login when needLogin is true and user is not logged in', () => {
    useUserStore.setState({ isSettled: true, userInfo: null });
    renderHook(() => useCheckLoginBase(true, mockCheckLoginImpl, mockGoLogin));
    expect(mockGoLogin).toHaveBeenCalled();
  });

  it('should not redirect when user is logged in', () => {
    useUserStore.setState({
      isSettled: true,
      userInfo: { user_id_str: '123' },
    });
    renderHook(() => useCheckLoginBase(true, mockCheckLoginImpl, mockGoLogin));
    expect(mockGoLogin).not.toHaveBeenCalled();
  });

  it('should handle UNAUTHORIZED event and redirect', () => {
    const { unmount } = renderHook(() =>
      useCheckLoginBase(true, mockCheckLoginImpl, mockGoLogin),
    );
    const handleUnauthorized = (handleAPIErrorEvent as Mock).mock.calls[0][1];

    act(() => handleUnauthorized());
    expect(mockReset).toHaveBeenCalled();
    expect(mockGoLogin).toHaveBeenCalled();

    unmount();
    expect(removeAPIErrorEvent).toHaveBeenCalledWith(
      APIErrorEvent.UNAUTHORIZED,
      handleUnauthorized,
    );
  });

  it('should not redirect on UNAUTHORIZED if needLogin is false', () => {
    renderHook(() => useCheckLoginBase(false, mockCheckLoginImpl, mockGoLogin));
    const handleUnauthorized = (handleAPIErrorEvent as Mock).mock.calls[0][1];

    act(() => handleUnauthorized());
    expect(mockGoLogin).not.toHaveBeenCalled();
  });
});
