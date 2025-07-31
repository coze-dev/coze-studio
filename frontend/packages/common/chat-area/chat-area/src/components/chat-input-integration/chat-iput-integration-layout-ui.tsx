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

import React, { useRef, type FC, type PropsWithChildren } from 'react';

import cls from 'classnames';

import { ChatInputLayoutProvider } from '../../context/chat-input-layout/provider';

import style from './index.module.less';

export type ChatInputIntegrationLayoutUISlots = PropsWithChildren<{
  chatInputSlot?: React.ReactNode;
  inputTopSlot?: React.ReactNode;
  absoluteTopSlot?: React.ReactNode;
  className?: string;
}>;
export const ChatInputIntegrationLayoutUI: FC<
  ChatInputIntegrationLayoutUISlots
> = ({ children, absoluteTopSlot, chatInputSlot, inputTopSlot, className }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <ChatInputLayoutProvider layoutContainerRef={ref}>
      <div
        ref={ref}
        className={cls(style['chat-input-integration-layout'], className)}
      >
        {absoluteTopSlot}
        {inputTopSlot}
        {chatInputSlot}
        {children}
      </div>
    </ChatInputLayoutProvider>
  );
};
