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
    // action 都是稳定引用，无需现场计算
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
      // 取值，需要运行时现场计算
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
