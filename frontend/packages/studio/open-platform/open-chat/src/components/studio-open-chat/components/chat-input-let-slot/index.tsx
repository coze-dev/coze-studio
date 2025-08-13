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

import { type FC, useEffect, useState } from 'react';

import cls from 'classnames';
import { OutlinedIconButton, UIKitTooltip } from '@coze-common/chat-uikit';
import { IconCozMore } from '@coze-arch/coze-design/icons';
import { Button, Popover, Space } from '@coze-arch/coze-design';

import { Layout } from '@/types/client';

import { useChatAppProps } from '../../store';
import { useIsShowBackground } from '../../hooks/use-is-show-background';
import {
  type ButtonProps,
  useChatChatButtonInfo,
  useChatOpInfo,
} from '../../hooks/use-chat-op-info';

import styles from './index.module.less';

const MoreBtn: FC<{
  buttonList: ButtonProps[];
}> = ({ buttonList }) => {
  const showBackground = useIsShowBackground();
  const [visible, setVisible] = useState(false);
  const { readonly } = useChatAppProps();
  useEffect(() => {
    document.addEventListener('click', () => {
      setVisible(false);
    });
    return () => {
      setVisible(false);
    };
  }, []);
  return (
    <Popover
      content={
        <Space className={styles.container} vertical spacing={0}>
          {buttonList?.map((item, index) => (
            <Button
              color="secondary"
              className={styles.button}
              icon={item?.icon}
              iconPosition="left"
              onClick={item?.onClick}
              disabled={item?.disabled}
              key={index}
            >
              {item?.text}
            </Button>
          ))}
        </Space>
      }
      trigger="custom"
      visible={visible}
      position="topLeft"
      style={{
        borderRadius: '4px',
      }}
    >
      <OutlinedIconButton
        data-testid="bot-edit-debug-chat-clear-button"
        showBackground={showBackground}
        disabled={readonly}
        icon={<IconCozMore className="text-18px" />}
        size="default"
        onClick={e => {
          e.stopPropagation();
          setVisible(visibleTemp => !visibleTemp);
        }}
        className={cls('mr-12px', '!rounded-full')}
      />
    </Popover>
  );
};

export const ChatInputLeftSlot = () => {
  const { chatInputLeftOps } = useChatOpInfo();
  const showBackground = useIsShowBackground();
  const { chatConfig } = useChatAppProps();
  const isMobile = chatConfig.ui?.base?.layout === Layout.MOBILE;
  const buttonClass = showBackground ? '!coz-fg-images-white' : '';

  const buttonList = useChatChatButtonInfo(chatInputLeftOps);
  if (chatInputLeftOps.length === 0) {
    return null;
  }

  return (
    <div className={styles['chat-input-left-slot']}>
      {buttonList.length > 1 ? <MoreBtn buttonList={buttonList} /> : null}
      {buttonList.length === 1 ? (
        <UIKitTooltip content={buttonList[0].text} hideToolTip={isMobile}>
          <OutlinedIconButton
            data-testid="bot-edit-debug-chat-clear-button"
            showBackground={showBackground}
            disabled={buttonList[0].disabled}
            icon={buttonList[0].icon}
            onClick={e => {
              buttonList[0].onClick?.();
            }}
            className={cls('mr-12px', '!rounded-full', buttonClass, {
              [styles.disabled]: buttonList[0].disabled,
            })}
          />
        </UIKitTooltip>
      ) : null}
    </div>
  );
};
