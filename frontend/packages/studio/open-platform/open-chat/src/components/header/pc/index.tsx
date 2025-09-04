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

import { useShallow } from 'zustand/react/shallow';
import cls from 'classnames';
import { IconCozSideNav } from '@coze-arch/coze-design/icons';
import { Button, IconButton } from '@coze-arch/coze-design';
import { Typography } from '@coze-arch/bot-semi';

import { useChatAppStore } from '@/components/studio-open-chat/store';
import {
  useChatChatButtonInfo,
  useChatOpInfo,
} from '@/components/studio-open-chat/hooks/use-chat-op-info';
import CozeLogoPng from '@/assets/coze-logo.png';

import { type ChatHeaderProps } from '../type';

import styles from './index.module.less';

const ChatHeader = ({
  iconUrl = CozeLogoPng,
  title = 'Coze Bot',
  extra,
  theme,
  isShowConversations,
}: ChatHeaderProps) => {
  const { headerTopLeftOps } = useChatOpInfo();
  const buttonList = useChatChatButtonInfo(headerTopLeftOps);
  const { updateCurrentConversationInfo, currentConversationInfo } =
    useChatAppStore(
      useShallow(s => ({
        updateCurrentConversationInfo: s.updateCurrentConversationInfo,
        currentConversationInfo: s.currentConversationInfo,
      })),
    );
  // 清空上下文已存在，且需要删除聊天记录按钮
  return (
    <header
      className={cls(styles.header, {
        [styles['bg-theme']]: theme === 'bg-theme',
      })}
    >
      {currentConversationInfo?.conversationListVisible ||
      !isShowConversations ? null : (
        <IconButton
          color="secondary"
          icon={<IconCozSideNav width="18px" height="18px" />}
          className={styles['conversation-list-btn']}
          onClick={() => {
            if (!currentConversationInfo) {
              return;
            }
            updateCurrentConversationInfo({
              ...currentConversationInfo,
              conversationListVisible: true,
            });
          }}
        />
      )}
      <img className={styles.avatar} src={iconUrl} alt="avatar" />
      <Typography.Text
        className={styles.title}
        ellipsis={{
          showTooltip: {
            opts: { style: { wordBreak: 'break-word' }, position: 'bottom' },
            type: 'tooltip',
          },
          rows: 1,
        }}
      >
        {title}
      </Typography.Text>
      {buttonList?.map(
        item => (
          <Button
            color="secondary"
            icon={item.icon}
            className={styles['icon-btn']}
            disabled={item.disabled}
            onClick={() => {
              item.onClick?.();
            }}
          />
        ),
        /*
        if (item === 'clearMessage') {
          return (
            <Button
              color="secondary"
              icon={<IconCozBroom width="18px" height="18px" />}
              className={styles['icon-btn']}
              onClick={() => {
                clearHistory();
              }}
            />
          );
        } else if (item === 'addNewConversation') {
          return (
            <Button
              color="secondary"
              icon={<IconAddNewConversation width="18px" height="18px" />}
              className={styles['icon-btn']}
              onClick={() => {
                clearHistory();
              }}
            />
          );
        }
        return null;*/
      )}

      {!!extra && extra}
    </header>
  );
};

export default ChatHeader;
