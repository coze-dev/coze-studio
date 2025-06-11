import { type ComponentType } from 'react';

import { type MessageBoxProps as UiKitMessageBoxProps } from '@coze-common/chat-uikit';

import { type Message } from '../../../store/types';
import {
  type SendMessageBoxProps,
  type ReceiveMessageBoxProps,
} from '../../../components/types';

export type CustomReceiveMessageBox = ComponentType<ReceiveMessageBoxProps>;

export type CustomSendMessageBox = ComponentType<SendMessageBoxProps>;

export type CustomMessageInnerBottomSlot = ComponentType<{ message: Message }>;

export type CustomTextMessageInnerTopSlot = ComponentType<{ message: Message }>;
export type CustomShareMessage = ComponentType;

export type CustomMessageBoxFooter = ComponentType<{
  refreshContainerWidth: () => void;
}>;

export type CustomUiKitMessageBoxProps = UiKitMessageBoxProps & {
  messageType?: 'receive' | 'send';
};
