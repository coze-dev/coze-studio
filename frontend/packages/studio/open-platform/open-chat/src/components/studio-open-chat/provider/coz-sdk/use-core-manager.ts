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

import { useMemo } from 'react';

import { mergeWith, isArray } from 'lodash-es';
import {
  RequestScene,
  type RequestManagerOptions,
} from '@coze-common/chat-core';

import { openApiHostByRegionWithToken } from '@/util/env';

import { useChatAppProps } from '../../store';
import { useUserInfo } from '../../hooks';
import { type ChatProviderFunc } from './type';
import { useChatCozeSdk } from './context';
import {
  useClearMessageContextAdapter,
  useSendMessageAdapter,
  useClearHistoryAdapter,
  useCommonOnAfterResponseHooks,
  useCommonOnBeforeRequestHooks,
  useCommonErrorResponseHooks,
  useMessageList,
  useBreakMessage,
} from './api-adapter';

export const useCoreManager = ({
  refChatFunc,
}: {
  refChatFunc?: React.MutableRefObject<ChatProviderFunc | undefined>;
}): RequestManagerOptions => {
  const userInfo = useUserInfo();
  const { refreshToken } = useChatCozeSdk();
  const clearMessageContextAdapter = useClearMessageContextAdapter();
  const sendMessageAdapter = useSendMessageAdapter(
    userInfo || undefined,
    refChatFunc,
  );
  const clearHistoryAdapter = useClearHistoryAdapter({ refChatFunc });
  const commonOnBeforeRequestHooks = useCommonOnBeforeRequestHooks();
  const commonOnAfterResponseHooks =
    useCommonOnAfterResponseHooks(refreshToken);
  const commonErrorResponseHooks = useCommonErrorResponseHooks(refreshToken);
  const messageListAdapter = useMessageList();
  const { requestManagerOptions } = useChatAppProps();
  const breakMessageAdapter = useBreakMessage();
  return useMemo(
    () =>
      mergeWith(
        {
          baseURL: openApiHostByRegionWithToken,
          scenes: {
            [RequestScene.SendMessage]: sendMessageAdapter,
            [RequestScene.ClearMessageContext]: clearMessageContextAdapter,
            [RequestScene.ClearHistory]: clearHistoryAdapter,
            [RequestScene.GetMessage]: messageListAdapter,
            [RequestScene.BreakMessage]: breakMessageAdapter,
          },
          hooks: {
            onBeforeRequest: commonOnBeforeRequestHooks,
            onAfterResponse: commonOnAfterResponseHooks,
            onErrorResponse: commonErrorResponseHooks,
          },
        },
        requestManagerOptions,
        (objValue, srcValue) => {
          if (isArray(objValue)) {
            return objValue.concat(srcValue);
          }
        },
      ),
    [
      sendMessageAdapter,
      clearMessageContextAdapter,
      clearHistoryAdapter,
      commonOnBeforeRequestHooks,
      commonOnAfterResponseHooks,
    ],
  );
};
