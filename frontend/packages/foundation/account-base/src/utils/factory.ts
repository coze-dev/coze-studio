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

import { setUserInfoContext } from '@coze-arch/logger';

import { type UserInfo } from '../types';
import { useUserStore } from '../store/user';

/**
 * Actively trigger to refresh user information
 * @param checkLogin check function
 */
export const refreshUserInfoBase = async (
  checkLogin: () => Promise<UserInfo>,
) => {
  useUserStore.setState({
    hasError: false,
  });
  const userInfo = await checkLogin();
  useUserStore.getState().setUserInfo(userInfo);
};

export const logoutBase = async (logout: () => Promise<void>) => {
  await logout();
  useUserStore.getState().reset();
};

export const checkLoginBase = async (
  checkLoginImpl: () => Promise<{
    userInfo?: UserInfo;
    hasError?: boolean;
  }>,
) => {
  useUserStore.setState({
    hasError: false,
  });
  const { userInfo, hasError } = await checkLoginImpl();
  if (hasError) {
    useUserStore.setState({
      hasError: true,
    });
    return;
  }
  if (userInfo) {
    setUserInfoContext(userInfo);
  }
  useUserStore.setState({
    userInfo,
    isSettled: true,
  });
};
