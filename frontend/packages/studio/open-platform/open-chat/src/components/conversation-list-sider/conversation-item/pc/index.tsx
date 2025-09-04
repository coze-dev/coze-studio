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

import { useState } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozMore } from '@coze-arch/coze-design/icons';
import { IconButton, Typography } from '@coze-arch/coze-design';
import { type Conversation } from '@coze/api';

import {
  conversationSortMap,
  type SortedConversationItem,
} from '@/types/conversations';

import { Operate } from './operate';

import s from './index.module.less';

export const PcConversationItem = ({
  isActive,
  item,
  shouldDisplayTime,
  onConversationChange,
  onRename,
  onDelete,
}: {
  isActive: boolean;
  item: SortedConversationItem;
  shouldDisplayTime: boolean;
  onConversationChange: (conversation: Conversation) => void;
  onRename: (conversation: Conversation) => void;
  onDelete: (conversation: Conversation) => void;
}) => {
  const [visible, setVisible] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setVisible(true);
  };

  return (
    <div className={s['conversation-item']}>
      {shouldDisplayTime ? (
        <div className={s['conversation-item-time']}>
          {conversationSortMap.get(item.sort)}
        </div>
      ) : null}
      <div
        className={cls(s['conversation-item-content'], {
          [s['conversation-item-content-active']]: isActive,
        })}
        onClick={() => onConversationChange(item)}
      >
        <Typography.Text
          style={{
            flex: 1,
          }}
          ellipsis={{
            showTooltip: {
              opts: {
                content: item.name,
                style: {
                  wordBreak: 'break-all',
                },
                position: 'top',
                spacing: 4,
              },
            },
          }}
        >
          {item.name ||
            I18n.t('web_sdk_conversation_default_name', {}, '新创建的会话')}
        </Typography.Text>
        <Operate
          onRename={() => {
            onRename(item);
            setVisible(false);
          }}
          onDelete={() => {
            onDelete(item);
            setVisible(false);
          }}
          visible={visible}
          setVisible={setVisible}
        >
          <IconButton
            className={s['conversation-operate']}
            onClick={handleClick}
            size="small"
            icon={<IconCozMore />}
            color="secondary"
          />
        </Operate>
      </div>
    </div>
  );
};
