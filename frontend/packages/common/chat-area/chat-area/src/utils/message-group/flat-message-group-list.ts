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

import { type MessageGroupMember, type MessageGroup } from '../../store/types';

export const flatMessageGroupIdList = (messageGroupList: MessageGroup[]) => {
  const messageIdListArray = messageGroupList.map(messageGroup => {
    const keys = Object.keys(
      messageGroup.memberSet,
    ) as (keyof MessageGroupMember)[];

    return keys
      .map(key => {
        const messageIdOrList = messageGroup.memberSet[key];

        if (Array.isArray(messageIdOrList)) {
          return messageIdOrList;
        }
        if (messageIdOrList) {
          return [messageIdOrList];
        }
        return [];
      })
      .flat();
  });
  return messageIdListArray.flat();
};
