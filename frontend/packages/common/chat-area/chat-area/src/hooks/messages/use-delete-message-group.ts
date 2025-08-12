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

import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from '../context/use-chat-area-context';
import { deleteMessageGroupById } from '../../utils/message-group/message-group';
import { useChatActionLockService } from '../../context/chat-action-lock';

// File messages and picture messages that are being uploaded are deleted, and side effects need to be cleared &
export const useDeleteMessageGroup = () => {
  const context = useChatAreaContext();
  const storeSet = useChatAreaStoreSet();
  const chatActionLockService = useChatActionLockService();

  return (groupId: string) =>
    deleteMessageGroupById(groupId, {
      ...context,
      storeSet,
      chatActionLockService,
    });
};
