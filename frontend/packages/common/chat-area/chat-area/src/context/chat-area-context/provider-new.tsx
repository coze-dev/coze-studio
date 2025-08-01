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
  forwardRef,
  type PropsWithChildren,
  useEffect,
  useImperativeHandle,
} from 'react';

import {
  LocalCacheContext,
  getReadLocalStoreValue,
  getWriteLocalStoreValue,
} from '@coze-common/chat-uikit';

import { UploadControllerProvider } from '../upload-controller-context/provider';
import { StoreSetContext } from '../store-set';
import { ProviderPassThroughContext } from '../preference/preference-context';
import { LoadMoreProvider } from '../load-more';
import { ChatActionLockContext } from '../chat-action-lock/chat-action-lock-context';
import { localLog } from '../../utils/local-log';
import { useCreateAndUpdateInitService } from '../../hooks/init/use-create-and-update-init-service';
import { useAutoUpdateUserInfo } from '../../hooks/init/use-auto-update-user-info';
import { useListenMessagesLengthChangeLayoutEffect } from '../../hooks/context/load-more/listen-message-length-change';
import {
  type ChatAreaProviderMethod,
  type ChatAreaProviderProps,
} from './type';
import { NullableChatAreaContext } from './context';

/**
 * requestToInit changes may cause reinitialization (extendDataLifecycle affects)
 */
export const ChatAreaProviderNew = forwardRef<
  ChatAreaProviderMethod,
  PropsWithChildren<ChatAreaProviderProps>
>((props, ref) => {
  const {
    botId,
    scene,
    userInfo,
    children,
    enableMarkRead,
    enableDragUpload,
    enableTwoWayLoad,
    showUserExtendedInfo,
    enableImageAutoSize,
    imageAutoSizeContainerWidth,
    enablePasteUpload,
    isInputReadonly,
    enableSelectOnboarding,
    uikitChatInputButtonStatus,
    onboardingSuggestionsShowMode,
    eventCallback,
    showBackground,
    stopRespondOverrideWaiting,
  } = props;

  checkBotIdOrPresetBot(props);

  localLog('render ChatAreaProvider');

  const { initControllerRef, configs } = useCreateAndUpdateInitService(props);

  const {
    destroyFullSite,
    storeSet,
    reporter,
    init,
    lifeCycleService,
    eventCenter,
    loadMoreClient,
    chatActionLockService,
    refreshMessageList,
  } = initControllerRef.current;

  const waitMessagesLengthChangeLayoutEffect =
    useListenMessagesLengthChangeLayoutEffect(
      initControllerRef.current.storeSet?.useMessagesStore,
    );

  initControllerRef.current.loadMoreEnvTools.waitMessagesLengthChangeLayoutEffect =
    waitMessagesLengthChangeLayoutEffect;

  useImperativeHandle(ref, () => {
    const method: ChatAreaProviderMethod = {
      resetStateFullSite: destroyFullSite,
      updateSenderInfo:
        storeSet?.useSenderInfoStore.getState().updateBotInfoByImmer,
      updateWaitingSenderId:
        storeSet?.useSenderInfoStore.getState().updateWaitingSenderId,
      refreshMessageList,
    };
    return method;
  });

  useAutoUpdateUserInfo({
    userInfo,
    storeSet,
  });

  useEffect(
    () => () => {
      initControllerRef.current?.destroy();
    },
    [],
  );

  /* TODO: Split the context */
  return (
    <NullableChatAreaContext.Provider
      value={{
        refreshMessageList,
        reporter,
        botId,
        scene,
        eventCallback,
        configs,
        manualInit: init,
        lifeCycleService,
        eventCenter,
      }}
    >
      <StoreSetContext.Provider value={{ ...storeSet }}>
        <ProviderPassThroughContext.Provider
          value={{
            enableMarkRead,
            enableTwoWayLoad,
            showUserExtendedInfo,
            enableImageAutoSize,
            imageAutoSizeContainerWidth,
            enablePasteUpload,
            isInputReadonly,
            enableDragUpload,
            enableSelectOnboarding,
            uikitChatInputButtonStatus,
            onboardingSuggestionsShowMode,
            showBackground,
            stopRespondOverrideWaiting,
          }}
        >
          <LocalCacheContext.Provider
            value={{
              readLocalStoreValue: getReadLocalStoreValue(reporter),
              writeLocalStoreValue: getWriteLocalStoreValue(reporter),
            }}
          >
            <UploadControllerProvider>
              <LoadMoreProvider loadMoreClient={loadMoreClient}>
                <ChatActionLockContext.Provider value={chatActionLockService}>
                  {children}
                </ChatActionLockContext.Provider>
              </LoadMoreProvider>
            </UploadControllerProvider>
          </LocalCacheContext.Provider>
        </ProviderPassThroughContext.Provider>
      </StoreSetContext.Provider>
    </NullableChatAreaContext.Provider>
  );
});

ChatAreaProviderNew.displayName = 'ChatAreaProviderNew';

const checkBotIdOrPresetBot = (props: ChatAreaProviderProps) => {
  if (props.botId || props.presetBot) {
    return;
  }
  throw new Error('Either botId or presetBot must to be provided!');
};
