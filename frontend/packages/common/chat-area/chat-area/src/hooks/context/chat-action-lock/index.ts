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

import { useCreation } from 'ahooks';
import { type Reporter } from '@coze-arch/logger';

import { ChatActionLockService } from '../../../service/chat-action-lock';
import { type StoreSet } from '../../../context/chat-area-context/type';

export const useInitChatActionLockService = ({
  storeSet: { useChatActionStore },
  enableChatActionLock,
  reporter,
}: {
  storeSet: Pick<StoreSet, 'useChatActionStore'>;
  enableChatActionLock: boolean | undefined;
  reporter: Reporter;
}): ChatActionLockService =>
  useCreation(() => {
    const {
      getAnswerActionLockMap,
      getGlobalActionLock,
      updateGlobalActionLockByImmer,
      updateAnswerActionLockMapByImmer,
    } = useChatActionStore.getState();

    const chatActionLockService = new ChatActionLockService({
      updateGlobalActionLockByImmer,
      getGlobalActionLock,
      updateAnswerActionLockMapByImmer,
      getAnswerActionLockMap,
      readEnvValues: () => ({
        enableChatActionLock: enableChatActionLock ?? false,
      }),
      reporter,
    });

    return chatActionLockService;
  }, []);
