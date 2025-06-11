import { type ComponentType } from 'react';

import { type MessageBoxProps } from '../../../components/types';
import {
  type CustomSendMessageBox,
  type CustomReceiveMessageBox,
  type CustomMessageInnerBottomSlot,
  type CustomTextMessageInnerTopSlot,
  type CustomShareMessage,
  type CustomMessageBoxFooter,
  type CustomUiKitMessageBoxProps,
} from './message-box';
import {
  type MessageListFloatSlot,
  type CustomContentBox,
} from './content-box';

/* eslint-disable @typescript-eslint/naming-convention */
export interface CustomComponent {
  ReceiveMessageBox: CustomReceiveMessageBox;
  SendMessageBox: CustomSendMessageBox;
  ContentBox: CustomContentBox;
  TextMessageInnerTopSlot: CustomTextMessageInnerTopSlot;
  InputAddonTop: ComponentType;
  MessageInnerBottomSlot: CustomMessageInnerBottomSlot;
  MessageListFloatSlot: MessageListFloatSlot;
  ShareMessage: CustomShareMessage;
  MessageBox: ComponentType<MessageBoxProps>;
  MessageBoxFooter: CustomMessageBoxFooter;
  MessageBoxHoverSlot: ComponentType;
  UIKitMessageBoxPlugin: ComponentType<CustomUiKitMessageBoxProps>;
  UIKitOnBoardingPlugin: ComponentType;
}
/* eslint-enable @typescript-eslint/naming-convention */
