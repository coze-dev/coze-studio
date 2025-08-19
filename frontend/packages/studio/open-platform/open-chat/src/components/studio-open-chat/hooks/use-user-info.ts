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

import { useMemo } from 'react';

import { nanoid } from 'nanoid';
import { type UserSenderInfo } from '@coze-common/chat-area';

import { useChatAppStore } from '../store';
export const useUserInfo = () => {
  const userInfo = useChatAppStore(s => s.userInfo);

  return useMemo<UserSenderInfo | null>(() => {
    const openUserInfo = userInfo;
    if (!openUserInfo) {
      return {
        id: nanoid(),
        nickname: '',
        url: '',
        userUniqueName: '',
        userLabel: null,
      };
    }

    const areaUserInfo: UserSenderInfo = {
      ...openUserInfo,
      userUniqueName: '',
      userLabel: null,
    };

    return areaUserInfo;
  }, [userInfo]);
};
