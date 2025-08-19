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

import { useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { type SceneConfig } from '@coze-common/chat-core';
import { type UserSenderInfo } from '@coze-common/chat-area';
import i18n from '@coze-arch/i18n/intl';

import { openApiHostByRegionWithToken } from '@/util/env';
import { catchParse } from '@/util';
import {
  useChatAppProps,
  useChatAppStore,
} from '@/components/studio-open-chat/store';

import { type ChatProviderFunc } from '../type';
import { messageConverterToSdk, MessageParser } from './message';

export const useSendMessageAdapter = (
  userInfo?: UserSenderInfo,
  refChatFunc?: React.MutableRefObject<ChatProviderFunc | undefined>,
): SceneConfig => {
  const { debug, chatConfig } = useChatAppProps();
  const { shortcuts } = useChatAppStore(
    useShallow(state => ({
      shortcuts: state.shortcuts,
    })),
  );

  const refChatConfig = useRef(chatConfig);
  const refConnectorId = useRef('');
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;
  refConnectorId.current = chatConfig?.auth?.connectorId || '';
  refChatConfig.current = chatConfig;
  return {
    url: '/v3/chat',
    hooks: {
      onBeforeSendMessage: [
        requestConfig => {
          const messageBody: Record<string, string> =
            catchParse(requestConfig.body) || {};
          const url = `${openApiHostByRegionWithToken}/v3/chat?conversation_id=${messageBody.conversation_id}`;
          const body = messageConverterToSdk.convertRequestBody({
            body: requestConfig.body,
            userInfo,
            connectorId: refConnectorId.current,
            parameters: refChatConfig.current.botInfo?.parameters,
            shortcuts: shortcutsRef.current,
          });
          Object.keys(debug?.cozeApiRequestHeader || {}).forEach(key => {
            requestConfig.headers.push([
              key,
              debug?.cozeApiRequestHeader?.[key] || '',
            ]);
          });
          requestConfig.headers.push([
            'Accept-Language',
            i18n.language === 'zh-CN' ? 'zh' : 'en',
          ]);
          return { ...requestConfig, body, url };
        },
      ],
      onGetMessageStreamParser: requestMessageRawBody =>
        MessageParser.getMessageParser({
          requestMessageRawBody,
          userInfo,
          sectionId: refChatFunc?.current?.getSectionId(),
        }),
    },
  };
};
