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

import { userStoreService } from '@coze-studio/user-store';
import { type UserSenderInfo } from '@coze-common/chat-area';

export const useUserSenderInfo = () => {
  const userLabel = userStoreService.useUserLabel();
  const userInfo = userStoreService.useUserInfo();
  if (!userInfo) {
    return null;
  }

  const userSenderInfo: UserSenderInfo = {
    url: userInfo?.avatar_url || '',
    nickname: userInfo?.name || '',
    id: userInfo?.user_id_str || '',
    userUniqueName: userInfo?.app_user_info?.user_unique_name || '',
    userLabel,
  };

  return userSenderInfo;
};
