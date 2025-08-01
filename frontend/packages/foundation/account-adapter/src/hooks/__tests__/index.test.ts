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

import { useLocation, useNavigate } from 'react-router-dom';

import { renderHook } from '@testing-library/react';
import { useCheckLoginBase } from '@coze-foundation/account-base';

import { signPath, signRedirectKey } from '../../utils/constants';
import { checkLoginImpl } from '../../utils';
import { useCheckLogin } from '..';

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock('../../src/utils', () => ({
  checkLoginImpl: vi.fn(),
}));

vi.mock('@coze-foundation/account-base', () => ({
  useCheckLoginBase: vi.fn(),
}));

const mockNavigate = vi.fn();
const mockUseLocation = vi.mocked(useLocation);
const mockUseNavigate = vi.mocked(useNavigate);

describe('useCheckLogin', () => {
  const mockLocation = {
    pathname: '/test',
    search: '?query=123',
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLocation.mockReturnValue(mockLocation);
  });

  it('should call useCheckLoginBase with correct parameters', () => {
    renderHook(() => useCheckLogin({ needLogin: true }));
    expect(useCheckLoginBase).toBeCalledWith(
      true,
      checkLoginImpl,
      expect.any(Function),
    );
  });

  it('should navigate to default loginFallbackPath when not provided and user is not logged in', () => {
    const mockUseCheckLoginBase = vi.mocked(useCheckLoginBase);
    mockUseCheckLoginBase.mockImplementation(
      (needLogin, checkLoginImpl, goLogin) => {
        goLogin();
      },
    );

    renderHook(() => useCheckLogin({ needLogin: true }));

    expect(mockNavigate).toBeCalledWith(
      `${signPath}?${signRedirectKey}=${encodeURIComponent(
        `${mockLocation.pathname}${mockLocation.search}`,
      )}`,
    );
  });

  it('should navigate to custom loginFallbackPath when provided and user is not logged in', () => {
    const loginFallbackPath = '/custom-login';
    const mockUseCheckLoginBase = vi.mocked(useCheckLoginBase);
    mockUseCheckLoginBase.mockImplementation(
      (needLogin, checkLoginImpl, goLogin) => {
        goLogin();
      },
    );

    renderHook(() => useCheckLogin({ needLogin: true, loginFallbackPath }));

    expect(mockNavigate).toBeCalledWith(
      `${loginFallbackPath}${mockLocation.search}`,
      { replace: true },
    );
  });
});
