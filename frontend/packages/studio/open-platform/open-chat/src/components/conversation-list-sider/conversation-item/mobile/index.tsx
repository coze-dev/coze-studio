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

import { useCallback, useRef, useState } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';
import { type Conversation } from '@coze/api';

import {
  conversationSortMap,
  type SortedConversationItem,
} from '@/types/conversations';

import { MobileConversationOperate } from './operate';

import s from './index.module.less';

export const MobileConversationItem = ({
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
  const [isTouched, setIsTouched] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longClickTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 长按检测时间（毫秒）
  const LONG_PRESS_DURATION = 500;
  const LONG_CLICK_DURATION = 300;

  const closeOperate = () => {
    setVisible(false);
    setIsTouched(false);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    longPressTimerRef.current = setTimeout(() => {
      setVisible(true);
    }, LONG_PRESS_DURATION);
    longClickTimerRef.current = setTimeout(() => {
      setIsTouched(true);
    }, LONG_CLICK_DURATION);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longClickTimerRef.current) {
      clearTimeout(longClickTimerRef.current);
      longClickTimerRef.current = null;
    }
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    if (longClickTimerRef.current) {
      clearTimeout(longClickTimerRef.current);
      longClickTimerRef.current = null;
    }
    // 如果用户移动手指，取消长按
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      closeOperate();
      longPressTimerRef.current = null;
    }
  }, []);

  return (
    <div className={s['conversation-item']}>
      {shouldDisplayTime ? (
        <div className={s['conversation-item-time']}>
          {conversationSortMap.get(item.sort)}
        </div>
      ) : null}
      <MobileConversationOperate
        onRename={() => {
          onRename(item);
          closeOperate();
        }}
        onDelete={() => {
          onDelete(item);
          closeOperate();
        }}
        visible={visible}
      >
        <div
          className={cls(s['conversation-item-content'], {
            [s['conversation-item-content-active']]: isActive,
            [s['conversation-item-content-touched']]: isTouched,
            [s['conversation-item-content-operate-visible']]: visible,
          })}
          onClick={() => {
            if (visible) {
              return;
            }
            onConversationChange(item);
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onContextMenu={e => {
            e.preventDefault();
          }}
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
        </div>
      </MobileConversationOperate>
      {visible ? (
        <div
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            closeOperate();
          }}
          className={s['conversation-item-mask']}
        ></div>
      ) : null}
    </div>
  );
};
