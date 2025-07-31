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

import { isEqual } from 'lodash-es';
import classNames from 'classnames';
import { MessageBox as UIKitMessageBox } from '@coze-common/chat-uikit';
import { ContentType } from '@coze-common/chat-core';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';
import { IconAlertStroked } from '@coze-arch/bot-icons';
import { IconSpin } from '@douyinfe/semi-icons';
import { Layout } from '@coze-common/chat-uikit-shared';

import { type ComponentTypesMap } from '../types';
import { getMessageUniqueKey } from '../../utils/message';
import { type Message, type MessageMeta } from '../../store/types';
import { usePluginCustomComponents } from '../../plugin/hooks/use-plugin-custom-components';
import { useDisplayUserInfo } from '../../hooks/uikit/use-display-user-info';
import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import { useResendMessage } from '../../hooks/messages/use-send-message';

import styles from './index.module.less';

interface SendStatusProps {
  message: Message;
  meta: MessageMeta;
  layout: Layout;
}

export const SendStatus: FC<SendStatusProps> = props => {
  const { meta, message, layout } = props;
  const resendMessage = useResendMessage();

  return (
    <div
      className={classNames(styles['message-right'], {
        // Adapt mobile end to solve the problem of mobile end loading and covering
        [styles['message-right-mobile'] as string]: layout === Layout.MOBILE,
        [styles['message-right-pc'] as string]: layout === Layout.PC,
      })}
    >
      {/* message sending status */}
      {meta.isSending ? (
        <IconSpin className={classNames(styles['icon-sending'])} spin />
      ) : null}
      {meta.isFail ? (
        <Tooltip
          trigger={layout === Layout.MOBILE ? 'custom' : 'hover'}
          content={I18n.t('chat_tooltips_resend')}
        >
          <IconAlertStroked
            size="small"
            className={classNames(styles['icon-fail'])}
            onClick={() => message && resendMessage(message)}
          />
        </Tooltip>
      ) : null}
    </div>
  );
};

export const BuildInSendMessageBox: ComponentTypesMap['sendMessageBox'] =
  React.memo(
    props => {
      const {
        message,
        meta,
        children,
        isMessageGroupLastMessage,
        readonly,
        getBotInfo,
        layout,
        renderFooter,
        hoverContent,
        enableImageAutoSize,
        imageAutoSizeContainerWidth,
        eventCallbacks,
        onError,
        isContentLoading,
      } = props;
      const CustomeUIKitMessageBox =
        usePluginCustomComponents('UIKitMessageBoxPlugin').at(0)?.Component ||
        UIKitMessageBox;

      const isThemeDisabled = [
        ContentType.File,
        ContentType.Card,
        ContentType.Mix,
      ].includes(message.content_type);
      const isMixContentMessage = message.content_type === ContentType.Mix;

      const isBorderTheme = message.content_type === ContentType.Image;

      const showBackground = useShowBackGround();

      const userSenderInfo = useDisplayUserInfo(message);

      return (
        <div
          className={classNames(styles.wrapper, {
            [styles['wrapper--short-spacing'] as string]:
              !isMessageGroupLastMessage,
          })}
        >
          <CustomeUIKitMessageBox
            messageType={'send'}
            messageId={getMessageUniqueKey(message)}
            theme={
              isBorderTheme ? 'border' : isThemeDisabled ? 'none' : 'primary'
            }
            classname={
              isMixContentMessage ? 'chat-uikit-mix-content-message-box' : ''
            }
            senderInfo={userSenderInfo || { id: '' }}
            showUserInfo={!meta.hideAvatar}
            right={
              meta.isFail || meta.isSending ? (
                <SendStatus message={message} meta={meta} layout={layout} />
              ) : null
            }
            readonly={readonly}
            getBotInfo={getBotInfo}
            layout={layout}
            message={message}
            showBackground={showBackground}
            renderFooter={renderFooter}
            hoverContent={hoverContent}
            imageAutoSizeContainerWidth={imageAutoSizeContainerWidth}
            enableImageAutoSize={enableImageAutoSize}
            eventCallbacks={eventCallbacks}
            onError={onError}
            isContentLoading={isContentLoading}
          >
            {children}
          </CustomeUIKitMessageBox>
        </div>
      );
    },
    (prevProps, nextProps) => isEqual(prevProps, nextProps),
  );

BuildInSendMessageBox.displayName = 'BuildInSendMessageBox';
