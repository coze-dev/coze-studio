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
