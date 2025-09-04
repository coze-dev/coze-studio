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

/* eslint-disable complexity */
import { type FC } from 'react';

import { BuilderChat } from '@coze-studio/open-chat';

import { type ChatContentProps } from '@/types/chat';
import { useGlobalStore } from '@/store';

import styles from './index.module.less';

type IOnImageClick = (extra: { url: string }) => void;

export const NonIframeApp: FC<
  ChatContentProps & { onImageClick: IOnImageClick }
> = ({ client, onImageClick }) => {
  const options = client?.options;
  const setThemeType = useGlobalStore(s => s.setThemeType);
  const isNeedExtra = options?.ui?.header?.isNeedClose ?? true;
  const areaUi = {
    showInputArea: true,
    isDisabled: false,
    uploadable: options?.ui?.chatBot?.uploadable,
    isNeedClearContext: options?.ui?.chatBot?.isNeedClearContext ?? true,
    isNeedClearMessage: false,
    isNeedAddNewConversation:
      options?.ui?.chatBot?.isNeedAddNewConversation ?? true,
    isNeedFunctionCallMessage:
      options?.ui?.chatBot?.isNeedFunctionCallMessage ?? true,
    isNeedQuote: options?.ui?.chatBot?.isNeedQuote,
    feedback: options?.ui?.chatBot?.feedback,
    header: {
      isShow: true,
      title: options?.ui?.chatBot?.title,
      icon: options?.ui?.base?.icon,
      ...options?.ui?.header,
      extra: isNeedExtra ? <div className={styles['extra-close']} /> : null,
    },
    conversations: options?.ui?.conversations,
    input: {
      isNeedAudio: options?.ui?.chatBot?.isNeedAudio,
    },
    footer: options?.ui?.footer,
  };
  return (
    <BuilderChat
      workflow={{
        id: options?.config?.appInfo?.workflowId,
        parameters: {
          ...options?.config?.appInfo?.parameters,
        },
      }}
      project={{
        type: 'app',
        mode: 'websdk',
        id: options?.config?.appInfo?.appId || '',
        conversationName: 'Default', // 走兜底逻辑
        layout: options?.ui?.base?.layout,
        version: options?.config.appInfo?.version,
      }}
      userInfo={{
        url: options?.userInfo?.url || '',
        nickname: options?.userInfo?.nickname || '',
        id: options?.userInfo?.id || '',
      }}
      areaUi={areaUi}
      auth={{
        type: 'external',
        token: options?.auth?.token,
        refreshToken: options?.auth?.onRefreshToken,
      }}
      eventCallbacks={{
        onImageClick,
        onThemeChange: setThemeType,
      }}
    />
  );
};
