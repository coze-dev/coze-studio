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
