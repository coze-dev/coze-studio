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
