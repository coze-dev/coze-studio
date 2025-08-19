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

import React, { type FC } from 'react';

import { WebSdkChat } from '@coze-studio/open-chat';

import { getChatConfig } from '@/util/get-chat-config';
import { type ChatContentProps } from '@/types/chat';
import { useGlobalStore } from '@/store';

import styles from './index.module.less';

type IOnImageClick = (extra: { url: string }) => void;

export const NonIframeBot: FC<
  ChatContentProps & { onImageClick: IOnImageClick }
> = props => {
  const title = props.client.options.ui?.chatBot?.title;
  const icon = props.client.options.ui?.base?.icon;
  const headerExtra = props.client.options.ui?.header?.isNeedClose ? (
    <div className={styles['extra-close']} />
  ) : null;
  const layout = props.client.options.ui?.base?.layout;
  const { onImageClick } = props;
  const { userInfo } = props.client.options;
  const setThemeType = useGlobalStore(s => s.setThemeType);

  const iframeParams = getChatConfig(
    props.client.chatClientId,
    props.client.options,
  );
  if (iframeParams.chatConfig.auth) {
    iframeParams.chatConfig.auth.onRefreshToken =
      props.client.options.auth?.onRefreshToken;
  }

  return (
    <div className={styles.chatAppWrapper}>
      <WebSdkChat
        title={title || ''}
        icon={icon}
        chatConfig={iframeParams.chatConfig}
        headerExtra={headerExtra}
        layout={layout}
        style={{
          height: '100%',
        }}
        onImageClick={onImageClick}
        onThemeChange={setThemeType}
        userInfo={userInfo}
      />
    </div>
  );
};
