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

import { type FC } from 'react';

import cs from 'classnames';
import { useInitStatus } from '@coze-common/chat-area';

import { webSdkDefaultConnectorId } from '@/util';
import {
  type StudioChatProviderProps,
  type WebSdkChatProps,
} from '@/types/props';
import { OpenApiSource } from '@/types/open';
import { ChatType, Layout } from '@/types/client';
import { useGetTheme } from '@/components/studio-open-chat/hooks/use-get-theme';
import {
  OpenChatProvider,
  StudioChatArea,
} from '@/components/studio-open-chat';
import { Loading } from '@/components/loading';
import { ChatHeader } from '@/components/header';
import ChatFooter from '@/components/footer';
import ErrorFallback from '@/components/error-fallback';
import { ErrorBoundary } from '@/components/error-boundary';

import styles from './index.module.less';

export const WebSdkChat: FC<WebSdkChatProps> = ({
  useInIframe = true,
  ...props
}) => {
  const { chatConfig } = props ?? {};
  if (!chatConfig?.bot_id) {
    return null;
  }
  if (chatConfig.auth) {
    chatConfig.auth.connectorId =
      chatConfig.auth.connectorId || webSdkDefaultConnectorId;
  }
  return <CozeChat {...props} useInIframe={useInIframe} />;
};

const CozeChat: FC<WebSdkChatProps> = props => {
  const {
    layout,
    className,
    useInIframe = false,
    chatConfig,
    userInfo,
    style,
    onImageClick,
    onThemeChange,
  } = props;
  if (!chatConfig.ui) {
    chatConfig.ui = {};
  }
  if (!chatConfig.ui.chatBot) {
    chatConfig.ui.chatBot = {};
  }
  if (chatConfig.auth?.type === 'token') {
    chatConfig.ui.chatBot.isNeedClearMessage = false;
    // chatConfig.ui.chatBot.isNeedAddNewConversation 不需要设置，按照用户的需要设置。
    chatConfig.ui.chatBot.isNeedAddNewConversation =
      chatConfig.ui.chatBot.isNeedAddNewConversation ?? true;
    chatConfig.ui.chatBot.isNeedClearContext =
      chatConfig.ui.chatBot.isNeedClearContext ?? true;
  } else {
    // 老版本的代码做兼容
    chatConfig.ui.chatBot.isNeedClearMessage = true;
    chatConfig.ui.chatBot.isNeedAddNewConversation = false;
    chatConfig.ui.chatBot.isNeedClearContext = false;
  }

  const chatProps: StudioChatProviderProps = {
    chatConfig: {
      ...chatConfig,
      source: OpenApiSource.WebSdk,
    },
    layout,
    userInfo,
    initErrorFallbackFC: ErrorFallback,
    onImageClick,
  };

  return (
    <ErrorBoundary>
      <div
        className={cs(
          styles.cozeChatApp,
          !useInIframe && styles.bordered,
          className,
        )}
        style={style}
      >
        <OpenChatProvider {...chatProps} onThemeChange={onThemeChange}>
          <WebSdkChatArea chatProps={chatProps} webSdkProps={props} />
        </OpenChatProvider>
      </div>
    </ErrorBoundary>
  );
};

const WebSdkChatArea: FC<{
  chatProps: StudioChatProviderProps;
  webSdkProps: WebSdkChatProps;
}> = ({ chatProps, webSdkProps }) => {
  const { layout, title, headerExtra, icon, chatConfig } = webSdkProps;
  const initStatus = useInitStatus();
  const isMobile = layout === Layout.MOBILE;
  const { header: headerConf, conversations } = chatConfig?.ui || {};
  const theme = useGetTheme();
  const isShowConversations =
    conversations?.isNeed && chatConfig.type !== ChatType.APP;

  if (initStatus !== 'initSuccess') {
    return <Loading />;
  }
  return (
    <div className={styles.content}>
      <StudioChatArea
        {...chatProps}
        enableMultimodalUpload={true}
        headerNode={
          <ChatHeader
            title={title}
            extra={headerExtra}
            iconUrl={icon}
            theme={theme}
            isMobile={isMobile}
            isShowConversations={isShowConversations}
            isShowHeader={headerConf?.isShow !== false}
          />
        }
      />
      <ChatFooter {...(chatConfig?.ui?.footer || {})} theme={theme} />
    </div>
  );
};
