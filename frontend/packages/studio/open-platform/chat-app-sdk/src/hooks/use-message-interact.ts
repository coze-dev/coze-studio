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

import { useEffect, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  type IframeParams,
  IframeMessageEvent,
  WebSdkError,
} from '@coze-studio/open-chat/types';
import { PostMessageChannel } from '@coze-arch/bot-utils/post-message-channel';

import { getChatConfig } from '@/util/get-chat-config';
import { type CozeChatOptions } from '@/types/client';
import { useGlobalStore } from '@/store/context';

export const useMessageInteract = (
  chatClientId: string,
  cozeChatOption: CozeChatOptions,
) => {
  const refPostChannel = useRef<PostMessageChannel>();
  //const [themeType, setThemeType] = useState<'bg-theme' | 'light'>('light');
  const {
    iframe: iframeEl,
    senderName,
    setThemeType,
  } = useGlobalStore(
    useShallow(s => ({
      iframe: s.iframe,
      senderName: s.senderName,
      setThemeType: s.setThemeType,
    })),
  );
  const refProps = useRef<{
    chatClientId: string;
    cozeChatOption: CozeChatOptions;
  }>({
    chatClientId,
    cozeChatOption,
  });
  refProps.current = {
    chatClientId,
    cozeChatOption,
  };

  useEffect(() => {
    if (iframeEl?.contentWindow) {
      refPostChannel.current = new PostMessageChannel({
        channelPort: iframeEl.contentWindow,
        senderName,
      });
      refPostChannel.current.onRequest<string | undefined, IframeParams>(
        IframeMessageEvent.GET_IFRAME_PARAMS,
        () => {
          const iframeParams = getChatConfig(
            refProps.current.chatClientId,
            refProps.current.cozeChatOption,
          );
          return {
            code: 0,
            data: iframeParams,
          };
        },
      );
      refPostChannel.current.onRequest<string | undefined, string | undefined>(
        IframeMessageEvent.GET_NEW_TOKEN,
        async token => {
          let tokenNew;
          try {
            tokenNew =
              await refProps.current.cozeChatOption.auth?.onRefreshToken?.(
                token || '',
              );
          } catch (e) {
            console.error('[WebSdk Error] Get Token Error');
          }

          if (tokenNew) {
            return {
              code: 0,
              data: tokenNew,
            };
          } else {
            return {
              code: WebSdkError.AUTH_TOKEN_GET_FAILED,
              message: 'Get Token Error',
            };
          }
        },
      );
      refPostChannel.current.onRequest<string | undefined, string | undefined>(
        IframeMessageEvent.THEME_CHANGE,
        theme => {
          setThemeType(theme as 'bg-theme' | 'light');
          return {
            code: 0,
          };
        },
      );
      return () => {
        refPostChannel.current?.destory();
        refPostChannel.current = undefined;
      };
    }
  }, [iframeEl, senderName]);
};
