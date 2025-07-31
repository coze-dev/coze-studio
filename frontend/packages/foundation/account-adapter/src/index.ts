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

export {
  getUserInfo,
  getLoginStatus,
  resetUserStore,
  setUserInfo,
  getUserLabel,
  useUserInfo,
  useLoginStatus,
  useAlterOnLogout,
  useHasError,
  useUserLabel,
  useUserAuthInfo,
  getUserAuthInfos,
  subscribeUserAuthInfos,
  useSyncLocalStorageUid,
  usernameRegExpValidate,
  type UserInfo,
  type LoginStatus,
} from '@coze-foundation/account-base';
export {
  refreshUserInfo,
  logout,
  checkLogin,
  connector2Redirect,
} from './utils';
export { useCheckLogin } from './hooks';

export { passportApi } from './passport-api';
