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

import { memo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { isEqual } from 'lodash-es';
import classNames from 'classnames';
import { MessageBox as UIKitMessageBox } from '@coze-common/chat-uikit';
import { ContentType } from '@coze-common/chat-core';

import { type ComponentTypesMap } from '../types';
import { PluginAsyncQuote } from '../plugin-async-quote';
import { getMessageUniqueKey } from '../../utils/message';
import { getReceiveMessageBoxTheme } from '../../utils/components/get-receive-message-box-theme';
import { usePluginCustomComponents } from '../../plugin/hooks/use-plugin-custom-components';
import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from '../../hooks/context/use-chat-area-context';
import { usePreference } from '../../context/preference';

import styles from './index.module.less';

import './index.less';

export const BuildInReceiveMessageBox: ComponentTypesMap['receiveMessageBox'] =
  memo(
    props => {
      const {
        message,
        meta,
        children,
        renderFooter,
        hoverContent,
        isMessageGroupFirstMessage,
        isMessageGroupLastMessage,
        readonly,
        getBotInfo,
        layout,
        topRightSlot,
        enableImageAutoSize,
        imageAutoSizeContainerWidth,
        eventCallbacks,
        onError,
      } = props;

      const isCard = message.content_type === ContentType.Card;
      const showBackground = useShowBackGround();

      const { eventCallback: { onParseReceiveMessageBoxTheme } = {} } =
        useChatAreaContext();
      const CustomeUIKitMessageBox =
        usePluginCustomComponents('UIKitMessageBoxPlugin').at(0)?.Component ||
        UIKitMessageBox;

      const { useSenderInfoStore } = useChatAreaStoreSet();
      const { theme: bizTheme } = usePreference();

      const senderInfo = useSenderInfoStore(
        useShallow(state => {
          const botId = Object.keys(state.botInfoMap).at(0);
          return state.getBotInfo(message.sender_id || botId);
        }),
      );

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
          <CustomeUIKitMessageBox
            messageType={'receive'}
            messageId={getMessageUniqueKey(message)}
            theme={getReceiveMessageBoxTheme({
              message,
              onParseReceiveMessageBoxTheme,
              bizTheme,
            })}
            classname={isCard ? 'chat-uikit-message-box-card' : ''}
            renderFooter={renderFooter}
            hoverContent={hoverContent}
            senderInfo={senderInfo || { id: '' }}
            showUserInfo={!meta.hideAvatar}
            readonly={readonly}
            getBotInfo={getBotInfo}
            layout={layout}
            showBackground={showBackground}
            message={message}
            topRightSlot={topRightSlot}
            imageAutoSizeContainerWidth={imageAutoSizeContainerWidth}
            enableImageAutoSize={enableImageAutoSize}
            eventCallbacks={eventCallbacks}
            onError={onError}
          >
            <PluginAsyncQuote message={message} />
            {children}
          </CustomeUIKitMessageBox>
        </div>
      );
    },
    (prevProps, nextProps) => isEqual(prevProps, nextProps),
  );

BuildInReceiveMessageBox.displayName = 'ChatAreaBuildInReceiveMessageBox';
