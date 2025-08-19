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

import { useEffect, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useMemoizedFn } from 'ahooks';
import { TokenManager } from '@coze-common/chat-core';

import { openApiHostByRegionWithToken } from '@/util/env';

import { useChatAppStore, useChatAppProps } from '../../store';
import { CozeApiCustom } from './helper/coze-api-custom';
export const useApiClient = () => {
  const { debug } = useChatAppProps();

  const {
    token = '',
    refreshToken: refreshTokenRaw,
    setToken,
    setCozeApi,
  } = useChatAppStore(
    useShallow(s => ({
      token: s.token,
      setToken: s.setToken,
      refreshToken: s.refreshToken,
      setCozeApi: s.setCozeApi,
    })),
  );

  const tokenManagerClient = useMemo<TokenManager>(
    () =>
      new TokenManager({
        apiKey: token,
      }),
    [],
  );

  // coze Api相关的 实例
  const cozeApiClient = useMemo<CozeApiCustom>(
    () =>
      new CozeApiCustom({
        token,
        allowPersonalAccessTokenInBrowser: true,
        baseURL: openApiHostByRegionWithToken,
        axiosOptions: {
          headers: {
            ...(debug?.cozeApiRequestHeader || {}),
          },
        },
      }),
    [],
  );
  // 语音播放相关的token实例
  // 更新各client实例的token，
  const updateToken = useMemoizedFn(newToken => {
    tokenManagerClient?.updateApiKey(newToken);
    cozeApiClient.token = newToken;
  });
  // 刷新token的逻辑
  const refreshToken = useMemoizedFn(async () => {
    const newToken = await refreshTokenRaw?.();
    if (newToken) {
      updateToken(newToken);
      setToken(newToken);
    }
    return newToken;
  });

  cozeApiClient.setRefreshToken(refreshToken);

  useEffect(() => {
    updateToken(token);
  }, [token]);

  useEffect(() => {
    setCozeApi(cozeApiClient);
  }, [cozeApiClient]);

  return {
    tokenManagerClient,
    cozeApiClient,
    refreshToken,
  };
};
