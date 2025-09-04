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

import React, {
  type FC,
  useMemo,
  type PropsWithChildren,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from 'react';

import { useShallow } from 'zustand/react/shallow';
import copy from 'copy-to-clipboard';
import { useMemoizedFn } from 'ahooks';
import { isFile } from '@coze-common/chat-uikit';
import { Scene } from '@coze-common/chat-core';
import { ReasoningPluginRegistry } from '@coze-common/chat-area-plugin-reasoning';
import {
  type GrabPublicMethod,
  useCreateGrabPlugin,
} from '@coze-common/chat-area-plugin-message-grab';
import {
  allIgnorableMessageTypes,
  ChatAreaProvider,
  useChatAreaStoreSet,
  type PluginRegistryEntry,
  useRegenerateMessageByUserMessageId,
  usePluginPublicMethods,
  PluginName,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { UIToast } from '@coze-arch/bot-semi';
import { type Conversation } from '@coze/api';

import { type SDKInitError, isAuthError } from '@/util/error';
import { ChatType } from '@/types/client';
import { studioOpenClientReporter, createSDKUploadPluginClass } from '@/helper';

import { useChatAppProps, useChatAppStore } from '../../store';
import { useUpdateConversationNameByMessage } from '../../hooks/use-update-conversation-name-by-message';
import { useIsShowBackground } from '../../hooks/use-is-show-background';
import { useUserInfo } from '../../hooks';
import { useUploadFileApi } from './use-upload-file-api';
import { useRequestInit } from './use-request-init';
import { useCoreOverrideConfig } from './use-core-override-config';
import { type ChatProviderFunc } from './type';
import { getCozeSdkPlugin } from './plugin';
import { useBgBackgroundPlugin } from './hooks/use-bg-background-plugin';
import { ChatCozeSdkProvider, useChatCozeSdk } from './context';
const ChatProviderFuncComp = forwardRef<
  ChatProviderFunc | undefined,
  PropsWithChildren
>(({ children }, ref) => {
  const { chatConfig } = useChatAppProps();
  const {
    updateCurrentConversationInfo,
    currentConversationInfo,
    updateConversations,
  } = useChatAppStore(
    useShallow(s => ({
      updateCurrentConversationInfo: s.updateCurrentConversationInfo,
      currentConversationInfo: s.currentConversationInfo,
      updateConversations: s.updateConversations,
    })),
  );
  const { useGlobalInitStore, useSectionIdStore } = useChatAreaStoreSet();
  const setConversationIdInArea = useGlobalInitStore(
    state => state.setConversationId,
  );
  const conversationId = useGlobalInitStore(state => state.conversationId);
  const sectionId = useSectionIdStore(state => state.latestSectionId);
  const chatCore = useGlobalInitStore(state => state.chatCore);
  const setConversationId = useMemoizedFn(
    (conversationIdNew: string, sectionIdNew: string) => {
      const isConversations =
        chatConfig.ui?.conversations?.isNeed &&
        chatConfig.type !== ChatType.APP;
      if (isConversations && currentConversationInfo) {
        const timestamp = Math.floor(Date.now() / 1000);
        const newConversation: Conversation = {
          id: conversationIdNew,
          last_section_id: sectionIdNew,
          updated_at: timestamp,
          created_at: timestamp,
          meta_data: {},
        };
        updateCurrentConversationInfo({
          ...currentConversationInfo,
          ...newConversation,
        });
        updateConversations([newConversation], 'add');
      } else {
        setConversationIdInArea(conversationIdNew);
        chatCore?.updateConversationId(conversationIdNew);
      }
    },
  );
  const getConversationId = useMemoizedFn(() => conversationId || '');
  const getSectionId = useMemoizedFn(() => sectionId || '');

  useUpdateConversationNameByMessage();

  const regenerateMessageByUserMessageId =
    useRegenerateMessageByUserMessageId();
  useImperativeHandle(
    ref,
    () => ({
      regenerateMessageByUserMessageId,
      setConversationId,
      getConversationId,
      getSectionId,
    }),
    [
      regenerateMessageByUserMessageId,
      setConversationId,
      getConversationId,
      getSectionId,
    ],
  );

  const grabPluginPublicMethods = usePluginPublicMethods<GrabPublicMethod>(
    PluginName.MessageGrab,
  );
  useEffect(() => {
    if (!grabPluginPublicMethods) {
      return;
    }

    grabPluginPublicMethods.updateEnableGrab(true);
  }, []);
  return <>{children}</>;
});

const ChatProviderImpl: FC<{
  children: React.ReactNode;
  plugins?: PluginRegistryEntry<unknown>[];
}> = ({ children, plugins }) => {
  const refLastIsError = useRef(false);
  const { refreshToken } = useChatCozeSdk();
  const { initError, setInitError } = useChatAppStore(
    useShallow(s => ({
      initError: s.initError,
      setInitError: s.setInitError,
    })),
  );
  const refChatFunc = useRef<ChatProviderFunc>();
  const {
    chatConfig,
    onImageClick,
    initErrorFallbackFC: ErrorFallback,
  } = useChatAppProps();
  const userInfo = useUserInfo();
  const requestToInit = useRequestInit();
  const createChatCoreOverrideConfig = useCoreOverrideConfig({
    refChatFunc,
  });
  const { GrabPlugin } = useCreateGrabPlugin({
    scene: 'store',
  });
  const uploadFileApi = useUploadFileApi();
  const isShowBackground = useIsShowBackground();
  const { ChatBackgroundPlugin } = useBgBackgroundPlugin();
  // plugin初始化
  const cozeSdkChatPlugin = getCozeSdkPlugin({
    refreshToken,
    regenerateMessageByUserMessageId: id => {
      refChatFunc.current?.regenerateMessageByUserMessageId?.(id);
    },
  });

  const SDKUploadPlugin = useMemo(
    () =>
      createSDKUploadPluginClass({
        botId: chatConfig.bot_id || '',
        source: chatConfig.source,
        uploadFile: uploadFileApi,
      }),
    [chatConfig, uploadFileApi],
  );
  useEffect(() => {
    if (!initError) {
      return;
    }
    if (refLastIsError.current) {
      return;
    }
    (async () => {
      try {
        if (isAuthError((initError as SDKInitError).code)) {
          await refreshToken?.();
          setInitError(false);
        }
      } catch (err) {
        console.error(err);
      }
      refLastIsError.current = true;
    })();
  }, [initError]);

  if (initError) {
    if (ErrorFallback) {
      return (
        <ErrorFallback
          error={initError === true ? null : initError}
          refresh={async () => {
            if (isAuthError((initError as SDKInitError).code)) {
              await refreshToken?.();
              setInitError(false);
            } else {
              location.reload();
            }
          }}
        />
      );
    }

    return null;
  }

  return (
    <ChatAreaProvider
      botId={chatConfig.bot_id}
      userInfo={userInfo}
      scene={Scene.OpenAipSdk}
      reporter={studioOpenClientReporter}
      requestToInit={requestToInit}
      enableChatActionLock
      createChatCoreOverrideConfig={createChatCoreOverrideConfig}
      eventCallback={{
        onImageClick,
        onInitSuccess: () => {
          refLastIsError.current = false;
        },
        onCopyUpload: ({ message: msg, extra: { fileIndex } }) => {
          if (isFile(msg.content_obj)) {
            copy(msg.content_obj.file_list[fileIndex ?? 0]?.file_key ?? '');
            UIToast.success({
              content: I18n.t('copy_success') ?? 'Copy Successfully',
            });
          }
        },
      }}
      configs={{
        showFunctionCallDetail: false,
        uploadPlugin: SDKUploadPlugin,
        ignoreMessageConfigList: allIgnorableMessageTypes,
        isShowFunctionCallBox:
          chatConfig?.ui?.chatBot?.isNeedFunctionCallMessage ?? true,
      }}
      pluginRegistryList={[
        cozeSdkChatPlugin,
        ReasoningPluginRegistry,
        ChatBackgroundPlugin,
        GrabPlugin,
        ...(plugins || []),
      ]}
      showBackground={isShowBackground}
      enableDragUpload={false}
    >
      <ChatProviderFuncComp ref={refChatFunc}>{children}</ChatProviderFuncComp>
    </ChatAreaProvider>
  );
};

export const ChatProvider: FC<{
  children: React.ReactNode;
  plugins?: PluginRegistryEntry<unknown>[];
}> = ({ children, plugins }) => (
  <ChatCozeSdkProvider>
    <ChatProviderImpl plugins={plugins}>{children}</ChatProviderImpl>
  </ChatCozeSdkProvider>
);
