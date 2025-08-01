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

import dayjs from 'dayjs';
import { userStoreService } from '@coze-studio/user-store';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { sendTeaEvent, type EVENT_NAMES } from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { SpaceType } from '@coze-arch/bot-api/developer_api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendTeaEventInBot(event: EVENT_NAMES, params?: any) {
  const { botId: botID } = useBotInfoStore.getState();
  const userInfo = userStoreService.getUserInfo();

  const {
    space: { id: spaceId, space_type },
  } = useSpaceStore.getState();
  const isPersonal = space_type === SpaceType.Personal;
  const timestamp = Date.now();
  sendTeaEvent(event, {
    user_id: userInfo?.user_id_str,
    timestamp,
    bot_id: botID,
    workspace_id: spaceId,
    workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
    ...params,
  });
}

const UNIX_LEN = 10;
const UNIX_LEN2 = 13;

export const transTimestampText = (text: string | undefined) => {
  try {
    if (!text) {
      return text;
    }
    const regex = /timestamp:"(\d{10,13})"/;
    const match = text.match(regex);
    if (match) {
      const timestamp = match?.[1];
      const format = 'YYYY-MM-DD HH:mm:ss';
      const strLen = `${timestamp}`.length;
      if (strLen === UNIX_LEN) {
        return `"${dayjs.unix(Number(timestamp)).format(format)}"`;
      } else if (strLen === UNIX_LEN2) {
        return `"${dayjs(Number(timestamp)).format(format)}"`;
      }
    }
    return text;
  } catch (error) {
    return text;
  }
};
