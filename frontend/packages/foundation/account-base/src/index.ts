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

// types
export type { UserInfo, LoginStatus } from './types';
export type {
  OAuth2RedirectConfig,
  Connector2Redirect,
} from './types/passport';

// common hooks
export {
  useLoginStatus,
  useUserInfo,
  useHasError,
  useAlterOnLogout,
  useUserLabel,
  useUserAuthInfo,
} from './hooks';

export { useSyncLocalStorageUid } from './hooks/use-sync-local-storage-uid';

// common utils
export {
  getUserInfo,
  getUserLabel,
  getLoginStatus,
  resetUserStore,
  setUserInfo,
  getUserAuthInfos,
  subscribeUserAuthInfos,
  usernameRegExpValidate,
} from './utils';

// base hooks
export { useCheckLoginBase } from './hooks/factory';

// base utils
export {
  refreshUserInfoBase,
  logoutBase,
  checkLoginBase,
} from './utils/factory';
