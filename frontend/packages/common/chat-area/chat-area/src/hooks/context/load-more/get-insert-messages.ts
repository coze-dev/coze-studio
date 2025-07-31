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

import { type GetHistoryMessageResponse } from '@coze-common/chat-core';

import type { StoreSet } from '../../../context/chat-area-context/type';
import { type ChatAreaEventCallback } from '../../../context/chat-area-context/chat-area-callback';

export const getInsertMessages =
  (
    storeSet: StoreSet,
    onBeforeLoadMoreInsertMessages: ChatAreaEventCallback['onBeforeLoadMoreInsertMessages'],
  ) =>
  (
    res: GetHistoryMessageResponse,
    { toLatest, clearFirst }: { toLatest: boolean; clearFirst?: boolean },
  ) => {
    const { useMessagesStore } = storeSet;
    const { addMessages, findMessage } = useMessagesStore.getState();

    onBeforeLoadMoreInsertMessages?.({ data: res });

    const newAddedMessages = clearFirst
      ? res.message_list
      : res.message_list.filter(msg => !findMessage(msg.message_id));
    addMessages(newAddedMessages, { toLatest, clearFirst });
  };
