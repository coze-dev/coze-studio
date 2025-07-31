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

import { type UserUpdateProfileRequest } from '@coze-studio/api-schema/passport';
import { passport } from '@coze-studio/api-schema';
import { resetUserStore, type UserInfo } from '@coze-foundation/account-base';

export const passportApi = {
  checkLogin: async () => {
    const res = (await passport.PassportAccountInfoV2({})) as unknown as {
      data: UserInfo;
    };
    return res.data;
  },

  logout: async () => {
    await passport.PassportWebLogoutGet({
      next: '/',
    });
  },

  uploadAvatar: async ({ avatar }: { avatar: File }) => {
    const res = await passport.UserUpdateAvatar({
      avatar,
    });

    return res.data;
  },

  updatePassword: async (params: { password: string; email: string }) => {
    await passport.PassportWebEmailPasswordResetGet({ ...params, code: '' });
    // After updating the password, the current login state is invalid, reset the store
    resetUserStore();
  },

  updateUserProfile: (params: UserUpdateProfileRequest) =>
    passport.UserUpdateProfile(params),
};
