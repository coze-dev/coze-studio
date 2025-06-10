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
