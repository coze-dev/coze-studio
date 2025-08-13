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

import { createPortal } from 'react-dom';
import { useState, type FC, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import cls from 'classnames';
import { Layout } from '@coze-studio/open-chat/types';

import { getCssVars } from '@/util/style';
import { type ChatContentProps } from '@/types/chat';
import { useGlobalStore } from '@/store/context';

import { Close } from '../icons/close';
import { ChatNonIframe } from './chat-non-iframe';

import styles from './index.module.less';

const ChatSlot: FC<
  ChatContentProps & { isNewCreated: boolean }
  // eslint-disable-next-line complexity
> = ({ client, isNewCreated }) => {
  const { chatVisible, setChatVisible, layout, themeType } =
    useGlobalStore(
      useShallow(s => ({
        layout: s.layout,
        setIframe: s.setIframe,
        senderName: s.senderName,
        chatVisible: s.chatVisible,
        setChatVisible: s.setChatVisible,
        themeType: s.themeType,
      })),
    );
  const {
    base: baseConf,
    chatBot: chatBotConf,
    header: headerConf,
  } = client?.options?.ui || {};

  const zIndex = baseConf?.zIndex;
  const zIndexStyle = getCssVars({ zIndex });
  const width =
    layout === Layout.MOBILE ? undefined : chatBotConf?.width || 460;
  if (!chatVisible) {
    // 不显示chat框
    return null;
  }

  return (
    <div
      className={cls(styles.iframeWrapper, 'coze-chat-sdk', {
        [styles.mobile]: layout === Layout.MOBILE,
        [styles.autoFixContainer]: !isNewCreated,
      })}
      style={{
        display: chatVisible ? 'block' : 'none',
        width,
        ...zIndexStyle,
      }}
    >
      {headerConf?.isNeedClose !== false ? (
        <Close
          onClick={() => {
            setChatVisible(false);
          }}
          classNames={styles.closeBtn}
          themeType={themeType === 'bg-theme' ? 'light' : 'dark'}
        />
      ) : null}
        <ChatNonIframe client={client} />
    </div>
  );
};

export const ChatContent: FC<ChatContentProps> = ({ client }) => {
  const { el } = client?.options?.ui?.chatBot || {};
  const [chatContentEl] = useState(() => {
    if (el) {
      return el;
    }
    const elCreated = document.createElement('div');
    document.body.appendChild(elCreated);
    return elCreated;
  });
  const isNewCreated = chatContentEl !== el;
  useEffect(
    () => () => {
      if (isNewCreated) {
        document.body.removeChild(chatContentEl);
      }
    },
    [el, chatContentEl],
  );

  return createPortal(
    <ChatSlot client={client} isNewCreated={isNewCreated} />,
    chatContentEl,
  );
};
