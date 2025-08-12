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

import { useEffect, useMemo, useRef } from 'react';

import type { Reporter } from '@coze-arch/logger';
import { DeveloperApi } from '@coze-arch/bot-api';

import { useChatAreaStoreSet } from '../use-chat-area-context';
import { LoadMoreEnvTools } from '../../../service/load-more/load-more-env-tools';
import { LoadMoreClient } from '../../../service/load-more';
import { type SystemLifeCycleService } from '../../../plugin/life-cycle';
import { useLoadMoreClient } from '../../../context/load-more';
import type {
  IgnoreMessageType,
  StoreSet,
} from '../../../context/chat-area-context/type';
import { type ChatAreaEventCallback } from '../../../context/chat-area-context/chat-area-callback';
import { useListenMessagesLengthChangeLayoutEffect } from './listen-message-length-change';
import { getLoadRequest } from './get-load-request';
import {
  getChatProcessing,
  getListenProcessChatStateChange,
} from './get-listen-process-chat-state-change';
import { getInsertMessages } from './get-insert-messages';

export const usePrepareLoadMore = ({
  storeSet,
  enableTwoWayLoad,
  enableMarkRead,
  reporter,
  ignoreMessageConfigList,
  lifeCycleService,
  eventCallback: { onBeforeLoadMoreInsertMessages },
}: {
  storeSet: StoreSet;
  enableTwoWayLoad: boolean;
  enableMarkRead: boolean;
  reporter: Reporter;
  ignoreMessageConfigList: IgnoreMessageType[];
  lifeCycleService: SystemLifeCycleService;
  eventCallback: Pick<ChatAreaEventCallback, 'onBeforeLoadMoreInsertMessages'>;
}) => {
  const {
    useMessageIndexStore,
    useGlobalInitStore,
    useMessagesStore,
    useWaitingStore,
  } = storeSet;
  const flagRef = useRef({ enableTwoWayLoad, enableMarkRead });
  flagRef.current = { enableTwoWayLoad, enableMarkRead };
  const waitMessagesLengthChangeLayoutEffect =
    useListenMessagesLengthChangeLayoutEffect(useMessagesStore);
  const { listenProcessChatStateChange, forceDispose } = useMemo(
    () => getListenProcessChatStateChange(useWaitingStore),
    [],
  );

  useEffect(() => forceDispose, []);

  const loadMoreEnv = useMemo(() => {
    // Actions are all stable references, no on-site calculations required
    const {
      updateCursor,
      updateIndex,
      updateHasMore,
      updateLockAndErrorByImmer,
      resetCursors,
      resetHasMore,
      resetLoadLockAndError,
      alignMessageIndexes,
      clearAll,
    } = useMessageIndexStore.getState();
    const envTools: LoadMoreEnvTools = new LoadMoreEnvTools({
      reporter,
      updateCursor,
      updateHasMore,
      updateIndex,
      resetCursors,
      resetHasMore,
      resetLoadLockAndError,
      alignMessageIndexes,
      updateLockAndErrorByImmer,
      clearMessageIndexStore: clearAll,
      insertMessages: getInsertMessages(
        storeSet,
        onBeforeLoadMoreInsertMessages,
      ),
      loadRequest: getLoadRequest({
        reporter,
        getChatCore: () => envTools.chatCore,
        ignoreMessageConfigList,
        lifeCycleService,
      }),
      requestMessageIndex: conversationId =>
        DeveloperApi.GetConversationParticipantsReadIndex({
          conversation_id:
            conversationId ||
            useGlobalInitStore.getState().conversationId ||
            '',
        }),
      // Value, requires on-site calculation at runtime
      readEnvValues: () => {
        const state = useMessageIndexStore.getState();
        const waitingState = useWaitingStore.getState();
        return {
          ...flagRef.current,
          ...state,
          isProcessingChat: getChatProcessing(waitingState),
        };
      },
      waitMessagesLengthChangeLayoutEffect,
      listenProcessChatStateChange,
    });
    return envTools;
  }, []);

  const loadMoreClient = useMemo(() => new LoadMoreClient(loadMoreEnv), []);

  return loadMoreClient;
};

export const useUpdateLoadEnvContent = () => {
  const loadMoreClient = useLoadMoreClient();
  const { useGlobalInitStore } = useChatAreaStoreSet();

  const chatCore = useGlobalInitStore(state => state.chatCore);
  useEffect(() => {
    loadMoreClient.injectChatCoreIntoEnv(chatCore);
  }, [chatCore]);
};
