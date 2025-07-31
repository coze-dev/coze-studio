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

import { type MethodCommonDeps } from '../../plugin/types';
import { useLoadMoreClient } from '../../context/load-more';
import { useChatActionLockService } from '../../context/chat-action-lock';
import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from './use-chat-area-context';

/**
 * Acquire containers for use in non-responsive environments
 */
export const useMethodCommonDeps = (): MethodCommonDeps => {
  const context = useChatAreaContext();
  const loadMoreClient = useLoadMoreClient();
  const chatActionLockService = useChatActionLockService();
  const storeSet = useChatAreaStoreSet();

  return {
    context,
    storeSet,
    services: {
      loadMoreClient,
      chatActionLockService,
    },
  };
};
