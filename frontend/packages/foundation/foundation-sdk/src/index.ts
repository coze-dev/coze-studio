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

import { type useCurrentTheme as useCurrentThemeOfSDK } from '@coze-arch/foundation-sdk';
import { useTheme } from '@coze-arch/coze-design';

export const useCurrentTheme: typeof useCurrentThemeOfSDK = () =>
  useTheme().theme;

export { logoutOnly, uploadAvatar } from './passport';

export {
  getIsSettled,
  getIsLogined,
  getUserInfo,
  getUserAuthInfos,
  useIsSettled,
  useIsLogined,
  useUserInfo,
  useUserAuthInfo,
  useUserLabel,
  subscribeUserAuthInfos,
  refreshUserInfo,
  useLoginStatus,
  getLoginStatus,
} from './user';

export { BackButton, SideSheetMenu } from '@coze-foundation/layout';

export { useSpace } from './space';
