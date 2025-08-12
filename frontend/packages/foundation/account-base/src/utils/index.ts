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

import { type UserAuthInfo } from '@coze-arch/idl/developer_api';
import { I18n } from '@coze-arch/i18n';

import { type UserInfo, type LoginStatus } from '../types';
import { useUserStore } from '../store/user';

/**
 * Acquire user information
 * @returns UserInfo
 */
export const getUserInfo = () => useUserStore.getState().userInfo;

/**
 * Get login status
 * @returns LoginStatus
 */
export const getLoginStatus = (): LoginStatus => {
  const state = useUserStore.getState();
  if (state.isSettled) {
    return state.userInfo?.user_id_str ? 'logined' : 'not_login';
  }
  return 'settling';
};

export const resetUserStore = () => useUserStore.getState().reset();

export const setUserInfo = (userInfo: UserInfo | null) =>
  useUserStore.getState().setUserInfo(userInfo);

export const getUserLabel = () => useUserStore.getState().userLabel;

export const getUserAuthInfos = () =>
  useUserStore.getState().getUserAuthInfos();

export const subscribeUserAuthInfos = (
  callback: (state: UserAuthInfo[], prev: UserAuthInfo[]) => void,
) => useUserStore.subscribe(state => state.userAuthInfos, callback);

const usernameRegExp = /^[0-9A-Za-z_]+$/;
const minLength = 4;
export const usernameRegExpValidate = (value: string) => {
  if (!usernameRegExp.exec(value)) {
    return I18n.t('username_invalid_letter');
  }
  if (value.length < minLength) {
    return I18n.t('username_too_short');
  }

  return null;
};
