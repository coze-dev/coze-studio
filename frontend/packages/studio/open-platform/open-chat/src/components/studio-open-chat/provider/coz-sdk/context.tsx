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

import React, {
  useContext,
  createContext,
  type ReactNode,
  useRef,
  type FC,
} from 'react';

import { type TokenManager } from '@coze-common/chat-core';
import { type CozeAPI } from '@coze/api';

import { useApiClient } from './use-api-client';

interface ContextValue {
  cozeApiSdk: CozeAPI;
  tokenManager: TokenManager;
  refreshToken?: () => Promise<string>;
  refMessageListLeft?: React.RefObject<Record<string, unknown>>;
}
// @ts-expect-error: 先不检查
export const ChatCozeSdkContext = createContext<ContextValue>({});
export const ChatCozeSdkProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const refMessageListLeft = useRef<Record<string, unknown>>({});
  const { tokenManagerClient, cozeApiClient, refreshToken } = useApiClient();

  return (
    <ChatCozeSdkContext.Provider
      value={{
        cozeApiSdk: cozeApiClient,
        tokenManager: tokenManagerClient,
        refMessageListLeft,
        refreshToken,
      }}
    >
      {children}
    </ChatCozeSdkContext.Provider>
  );
};

export const useChatCozeSdk = (): ContextValue => {
  const { cozeApiSdk, tokenManager, refMessageListLeft, refreshToken } =
    useContext(ChatCozeSdkContext);
  return {
    cozeApiSdk,
    tokenManager,
    refMessageListLeft,
    refreshToken,
  };
};
