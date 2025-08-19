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

import axios from 'axios';
import { type RequestManagerOptions } from '@coze-common/chat-core';

import { isAuthError } from '@/util/error';
import { useChatAppProps } from '@/components/studio-open-chat/store';

export const useCommonOnBeforeRequestHooks =
  (): Required<RequestManagerOptions>['hooks']['onBeforeRequest'] => {
    const { debug } = useChatAppProps();
    return [
      // 去除无用的头部
      requestConfig => {
        requestConfig.headers.delete('x-requested-with');
        Object.keys(debug?.cozeApiRequestHeader || {}).forEach(key => {
          requestConfig.headers.set(
            key,
            debug?.cozeApiRequestHeader?.[key] || '',
          );
        });
        return requestConfig;
      },
    ];
  };
const handleCommonError = async (
  response,
  refreshToken?: () => Promise<string>,
) => {
  const { code } = response?.response?.data || {};
  let responseOut = response;
  if (isAuthError(code)) {
    const token = await refreshToken?.();
    if (token) {
      const config = { ...response.config };
      config.headers = { ...config.headers };
      config.headers.Authorization = `Bearer ${token}`;
      responseOut = await axios.request(config);
    }
  }

  return responseOut;
};

export const useCommonErrorResponseHooks = (
  refreshToken?: () => Promise<string>,
): Required<RequestManagerOptions>['hooks']['onErrorResponse'] =>
  useMemo(
    () => [async response => handleCommonError(response, refreshToken)],
    [refreshToken],
  );
export const useCommonOnAfterResponseHooks = (
  refreshToken?: () => Promise<string>,
): Required<RequestManagerOptions>['hooks']['onAfterResponse'] =>
  useMemo(
    () => [
      // 用户登录权限判断
      async response => handleCommonError(response, refreshToken),
      // 用户Url恢复
      response => {
        if (
          response.config.url &&
          /^\/v1\/conversations\/[^\\]+\/clear$/.test(response.config.url)
        ) {
          return {
            ...response,
            config: {
              ...response.config,
              url: '/v1/conversations/:conversation_id/clear',
            },
          };
        }
        return response;
      },
    ],
    [refreshToken],
  );
