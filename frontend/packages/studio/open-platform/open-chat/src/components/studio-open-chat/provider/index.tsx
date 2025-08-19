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

import React, { useEffect, type FC } from 'react';

import { type PluginRegistryEntry } from '@coze-common/chat-area';

import { type StudioChatProviderProps } from '@/types/props';

import { ChatPropsProvider } from '../store/context';
import { useChatAppProps, useChatAppStore } from '../store';
import { getChatCommonPlugin } from '../plugin';
import { useGetTheme } from '../hooks/use-get-theme';
import { ChatProvider as ChatProviderCozeSdk } from './coz-sdk/chat-provider';

const ChatProvider: FC<{
  children: React.ReactNode;
  plugins?: PluginRegistryEntry<unknown>[];
}> = ({ children, plugins }) => {
  const { chatConfig, onImageClick, onThemeChange } = useChatAppProps();
  const setInitError = useChatAppStore(s => s.setInitError);
  // plugin初始化
  const commonChatPlugin = getChatCommonPlugin({
    onImageClick,
    onInitialError: () => {
      setInitError(true);
    },
    extraBody: chatConfig.extra?.webChat,
  });
  const theme = useGetTheme();
  useEffect(() => {
    onThemeChange?.(theme);
  }, [theme]);
  return (
    <ChatProviderCozeSdk
      plugins={[
        commonChatPlugin as PluginRegistryEntry<unknown>,
        ...(plugins || []),
      ]}
    >
      {children}
    </ChatProviderCozeSdk>
  );
};

export const OpenChatProvider: FC<
  StudioChatProviderProps & {
    children: React.ReactNode;
    plugins?: PluginRegistryEntry<unknown>[];
  }
> = ({ children, plugins, ...props }) => (
  <ChatPropsProvider appProps={props}>
    <ChatProvider plugins={plugins}>{children}</ChatProvider>
  </ChatPropsProvider>
);
