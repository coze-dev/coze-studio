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

import { useCallback, useEffect } from 'react';

import {
  type PostMessage,
  PostMessageEvent,
} from '@coze-studio/open-chat/types';

import { postMessageUtil } from '@/types/post';
import { useGlobalStore } from '@/store';
import { type WebChatClient } from '@/client';

export const useImagePreview = (client: WebChatClient) => {
  const { setImagePreview } = useGlobalStore(s => ({
    setImagePreview: s.setImagePreview,
  }));
  const onMessageHandler = useCallback<{
    (event: MessageEvent<PostMessage>): void;
  }>(
    event => {
      const msg = event?.data;

      if (msg.chatStoreId !== client.chatClientId) {
        return;
      }

      switch (msg.event) {
        case PostMessageEvent.ImageClick:
          // @ts-expect-error -- linter-disable-autofix
          if (postMessageUtil.isImageClick(msg)) {
            setImagePreview(preview => {
              preview.url = msg.payload.url;
              preview.visible = true;
            });
          }
          break;
        default:
      }
    },
    [setImagePreview, client],
  );

  useEffect(() => {
    window.addEventListener('message', onMessageHandler);
    return () => {
      window.removeEventListener('message', onMessageHandler);
    };
  }, [onMessageHandler]);
};
