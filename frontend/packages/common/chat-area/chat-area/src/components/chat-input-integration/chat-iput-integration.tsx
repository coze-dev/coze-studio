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

import { createPortal } from 'react-dom';
import React, {
  forwardRef,
  type PropsWithChildren,
  type RefObject,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import type { InputRefObject } from '@coze-common/chat-uikit';

import { ChatInputArea as BuiltinChatInputArea } from '../chat-input';
import { useChatAreaCustomComponent } from '../../hooks/context/use-chat-area-custom-component';
import { usePreference } from '../../context/preference';
import { ChatInputIntegrationLayoutUI } from './chat-iput-integration-layout-ui';
import { ChatInputAbsoluteSlot as BuiltinAbsoluteSlot } from './chat-input-absolute-slot';

export type ChatInputIntegrationProps = PropsWithChildren<{
  className?: string;
}>;

export interface ChatInputIntegrationSlots {
  absoluteSlot?: React.ReactNode;
  getContainer?: () => HTMLElement;
}

export interface ChatInputIntegrationController {
  setChatInputSlotVisible: (visible: boolean) => void;
  setChatInputTopSlotVisible: (visible: boolean) => void;
  getChatInputController: RefObject<() => InputRefObject>;
}

export const ChatInputIntegration = forwardRef<
  ChatInputIntegrationController,
  ChatInputIntegrationProps & ChatInputIntegrationSlots
>((props, ref) => {
  const { showInputArea } = usePreference();
  const componentTypes = useChatAreaCustomComponent();
  const { chatInputIntegration } = componentTypes;

  const getChatInputController = useRef<() => InputRefObject>(null);

  const [chatInputSlotVisible, setChatInputSlotVisible] = useState<boolean>(
    Boolean(true),
  );

  const [chatInputTopSlotVisible, setChatInputTopSlotVisible] =
    useState<boolean>(Boolean(true));

  const controller = {
    setChatInputSlotVisible,
    setChatInputTopSlotVisible,
    getChatInputController,
  };

  const renderChatInputSlot =
    chatInputIntegration?.renderChatInputSlot ||
    (() => <BuiltinChatInputArea ref={getChatInputController} />);

  const renderChatInputTopSlot =
    chatInputIntegration?.renderChatInputTopSlot || (() => null);

  const ChatInputSlot = chatInputSlotVisible && renderChatInputSlot(controller);

  const ChatInputTopSlot =
    chatInputTopSlotVisible && renderChatInputTopSlot(controller);

  const absoluteSlot = props?.absoluteSlot || <BuiltinAbsoluteSlot />;

  useImperativeHandle(ref, () => controller);

  if (!showInputArea) {
    return null;
  }

  const content = (
    <ChatInputIntegrationLayoutUI
      className={props.className}
      absoluteTopSlot={absoluteSlot}
      inputTopSlot={ChatInputTopSlot}
      chatInputSlot={ChatInputSlot}
    >
      {props.children}
    </ChatInputIntegrationLayoutUI>
  );

  if (props.getContainer) {
    return createPortal(content, props.getContainer());
  }

  return content;
});

ChatInputIntegration.displayName = 'ChatInputIntegration';
