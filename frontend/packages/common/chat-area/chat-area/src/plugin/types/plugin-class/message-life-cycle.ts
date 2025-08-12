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

// eslint-disable-next-line @coze-arch/no-pkg-dir-import
import { type GetHistoryMessageProps } from '@coze-common/chat-core/src/message/types/message-manager';
import {
  type SendMessageOptions,
  type ContentType,
  type ChatCoreError,
} from '@coze-common/chat-core';

import { type MessageGroup, type Message } from '../../../store/types';
import { type SendMessageFrom } from '../../../context/chat-area-context/chat-area-callback';

export interface OnBeforeSendMessageContext {
  message: Message<ContentType>;
  from: SendMessageFrom;
  options?: SendMessageOptions;
}

export interface OnAfterSendMessageContext {
  message: Message<ContentType>;
  from: SendMessageFrom;
  options?: SendMessageOptions;
}

export interface OnSendMessageErrorContext {
  message: Message<ContentType>;
  from: SendMessageFrom;
  options?: SendMessageOptions;
  error?: unknown;
}

export interface OnBeforeReceiveMessageContext {
  message: Message<ContentType>;
}

export type OnBeforeProcessReceiveMessageContext =
  OnBeforeReceiveMessageContext;

export interface OnBeforeMessageGroupListUpdateContext {
  messageGroupList: MessageGroup[];
}

export type OnAfterProcessReceiveMessageContext = OnBeforeReceiveMessageContext;

export interface OnBeforeDeleteMessageContext {
  messageGroup: MessageGroup;
}

export type OnAfterDeleteMessageContext = OnBeforeDeleteMessageContext;

export type OnDeleteMessageErrorContext = OnBeforeDeleteMessageContext;

export type OnBeforeGetMessageHistoryListContext = Omit<
  GetHistoryMessageProps,
  'conversation_id' | 'scene' | 'bot_id' | 'preset_bot' | 'draft_mode'
>;

export interface OnBeforeAppendSenderMessageIntoStore {
  message: Message<ContentType>;
  from: SendMessageFrom;
}

export interface OnAfterAppendSenderMessageIntoStore {
  message: Message<ContentType>;
  from: SendMessageFrom;
}

export interface OnBeforeDistributeMessageIntoMemberSetContent {
  message: Message<ContentType>;
  memberSetType?: MemberSetType;
}

export type MemberSetType = 'llm' | 'follow_up' | 'user' | 'function_call';

export interface OnMessagePullingErrorContext {
  replyId: string;
  localMessageId: string;
  error: ChatCoreError | undefined;
}

export interface OnMessagePullingSuccessContext {
  localMessageId: string;
  replyId: string;
}
