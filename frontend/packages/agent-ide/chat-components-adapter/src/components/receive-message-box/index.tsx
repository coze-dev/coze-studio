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

import React from 'react';

import { isEqual } from 'lodash-es';
import classNames from 'classnames';
import { useChatBackgroundState } from '@coze-studio/bot-detail-store';
import { MessageBox as UIKitMessageBox } from '@coze-common/chat-uikit';
import {
  type ComponentTypesMap,
  useBotInfoWithSenderId,
  PluginAsyncQuote,
  getReceiveMessageBoxTheme,
} from '@coze-common/chat-area';

import styles from './index.module.less';

export const ReceiveMessageBox: ComponentTypesMap['receiveMessageBox'] =
  React.memo(
    props => {
      const {
        message,
        meta,
        renderFooter,
        children,
        isMessageGroupFirstMessage,
        isMessageGroupLastMessage,
        enableImageAutoSize,
        imageAutoSizeContainerWidth,
        eventCallbacks,
        isContentLoading,
      } = props;
      const { showBackground } = useChatBackgroundState();

      const senderInfo = useBotInfoWithSenderId(message.sender_id);

      const isOnlyChildMessage =
        isMessageGroupFirstMessage && isMessageGroupLastMessage;

      return (
        <div
          className={classNames(styles.wrapper, {
            [styles['wrapper-last'] as string]: isMessageGroupLastMessage,
            [styles['wrapper-short-spacing'] as string]:
              !isMessageGroupFirstMessage && !isMessageGroupLastMessage,
            [styles['wrapper-only-one'] as string]: isOnlyChildMessage,
          })}
        >
          <div
            className={styles['message-wrapper']}
            data-testid="bot.ide.chat_area.message_box"
          >
            <UIKitMessageBox
              messageId={
                message.message_id || message.extra_info.local_message_id
              }
              theme={getReceiveMessageBoxTheme({
                message,
                onParseReceiveMessageBoxTheme: undefined,
                bizTheme: 'debug',
              })}
              renderFooter={renderFooter}
              senderInfo={senderInfo || { id: '' }}
              showUserInfo={!meta.hideAvatar}
              getBotInfo={() => undefined}
              showBackground={showBackground}
              enableImageAutoSize={enableImageAutoSize}
              imageAutoSizeContainerWidth={imageAutoSizeContainerWidth}
              eventCallbacks={eventCallbacks}
              isCardDisabled={meta.cardDisabled}
              isContentLoading={isContentLoading}
            >
              <PluginAsyncQuote message={message} />
              {children}
            </UIKitMessageBox>
          </div>
        </div>
      );
    },
    (prevProps, nextProps) => isEqual(prevProps, nextProps),
  );
