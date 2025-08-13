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
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useState,
  useMemo,
  useRef,
} from 'react';

import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { nanoid } from 'nanoid';
import { merge } from 'lodash-es';
import { useUpdateEffect } from 'ahooks';

import { ChatSdkError, SDKErrorCode } from '@/util/error';
import {
  type CozeChatConfig,
  type StudioChatProviderProps,
} from '@/types/props';
import { OpenApiSource } from '@/types/open';
import { ChatType, Layout } from '@/types/client';
import { type ConversationListSiderRef } from '@/components/conversation-list-sider/conversation-list';
import { ConversationListSider } from '@/components/conversation-list-sider';

import { createChatStore, type ChatStore, type ChatStateAction } from './store';

export const ChatPropsContext = createContext<{
  appProps?: StudioChatProviderProps;
  store?: ChatStore;
}>({});
interface CProps extends StudioChatProviderProps {
  chatConfig: CozeChatConfig;
}
export const ChatPropsProvider: FC<{
  children: ReactNode;
  appProps: StudioChatProviderProps;
}> = ({ children, appProps }) => {
  const defaultChatConfig = useMemo(
    () => ({
      conversation_id: nanoid(),
      source: OpenApiSource.WebSdk,
    }),
    [],
  );

  const conversationRef = useRef<
    Pick<ConversationListSiderRef, 'getConversationInfo'>
  >({
    getConversationInfo: () => undefined,
  });

  {
    /* app 模式暂时不支持，先从 UI 阶段去掉这个适配 */
  }
  const isShowConversations =
    appProps.chatConfig.ui?.conversations?.isNeed &&
    appProps.chatConfig.type !== ChatType.APP;

  const appPropsState = useMemo(() => {
    // 这里是当有会话列表这个功能时，需要通过注入 openRequestInit 的方式注入会话列表中选择了的会话 id 和 选取 id
    const openRequestInit: StudioChatProviderProps['openRequestInit'] =
      async cozeApi => {
        let res;
        if (typeof appProps.openRequestInit === 'function') {
          res = await appProps.openRequestInit(cozeApi);
        } else if (appProps.openRequestInit) {
          res = appProps.openRequestInit;
        }
        return {
          ...res,
          ...conversationRef.current?.getConversationInfo(), // 这里是因为 ChatType.APP 模式下的 ChatSDK 会注入一些 botInfo 信息
        };
      };
    const state = {
      ...appProps,
      openRequestInit,
      chatConfig: merge({}, defaultChatConfig, appProps.chatConfig),
    };
    state.chatConfig.conversation_id =
      state.chatConfig.conversation_id || defaultChatConfig.conversation_id;
    return state;
  }, [appProps]);

  const [store] = useState<ChatStore>(() =>
    createChatStore(appProps.chatConfig, appProps.userInfo),
  );
  useUpdateEffect(() => {
    if (appProps.userInfo) {
      store.getState().setUserInfo(appProps.userInfo);
    }
  }, [appProps.userInfo]);
  return (
    <ChatPropsContext.Provider
      value={{
        appProps: appPropsState,
        store,
      }}
    >
      {isShowConversations ? (
        <ConversationListSider ref={conversationRef}>
          {children}
        </ConversationListSider>
      ) : (
        children
      )}
    </ChatPropsContext.Provider>
  );
};

export const useChatAppProps = (): CProps => {
  const { appProps } = useContext(ChatPropsContext);

  const {
    chatConfig = {
      conversation_id: nanoid(),
      source: OpenApiSource.WebSdk,
      bot_id: '',
    },
    layout = Layout.PC,
    enableReplacePrologueNicknameWithVar = false,
  } = appProps ?? {};

  return {
    ...appProps,
    chatConfig,
    layout,
    enableReplacePrologueNicknameWithVar,
  };
};

export const useChatAppStore: <T>(
  selector: (store: ChatStateAction) => T,
) => T = selector => {
  const { store } = useContext(ChatPropsContext);
  if (!store) {
    throw ChatSdkError.create(SDKErrorCode.StoreProvider);
  }
  return useStoreWithEqualityFn(store, selector, shallow);
};
