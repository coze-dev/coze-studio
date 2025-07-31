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

import { type MouseEvent } from 'react';

import { type MessageBoxTheme } from '@coze-common/chat-uikit';
import {
  type ClearMessageContextParams,
  type SendMessageOptions,
  type ContentType,
  type Message,
  type ChatCoreError,
  type GetHistoryMessageResponse,
} from '@coze-common/chat-core';
import { type IOnLinkClickParams } from '@coze-common/chat-uikit-shared';

import {
  type Message as BuiltInMessage,
  type MessageGroup,
} from '../../store/types';

export type SendMessageFrom =
  | 'regenerate'
  | 'suggestion'
  | 'inputAndSend'
  | 'clickCard'
  | 'shortcut'
  | 'other'
  | 'plugin';

export interface MessageCallbackParams {
  message: Message<ContentType>;
  options?: SendMessageOptions;
}

export type SendMessageCallback = (
  params: MessageCallbackParams,
  from: SendMessageFrom,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- why is the upper layer inferred as void when used
) => MessageCallbackParams | void;

export type SendMessageFailedCallback = (
  params: MessageCallbackParams,
  from: SendMessageFrom,
  error: unknown,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- why is the upper layer inferred as void when used
) => MessageCallbackParams | void;

export type MessageCallback = (
  params: MessageCallbackParams,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- why is the upper layer inferred as void when used
) => MessageCallbackParams | void;

export interface SelectionChangeParams {
  messageList: BuiltInMessage[];
  replyIdList: string[];
  checkedLength: number;
  isAllChecked: boolean;
}

export type SelectionChangeCallback = (params: SelectionChangeParams) => void;

export interface OnboardingSelectChangeParams {
  onboarding: Partial<{
    prologue: string;
  }>;
  selectedId: string | null;
}

export type OnboardingSelectChangeCallback = (
  params: OnboardingSelectChangeParams,
  isAlreadyHasSelect: boolean,
) => void;
/**
 * Events sent externally by ChatArea
 * external response
 */
export interface ChatAreaLifeCycleEventMap {
  onInitSuccess: () => void;
  onInitError: () => void;
  onDestroy: () => void;
  /**
   * @param params frozen
   */
  onBeforeMessageSend: SendMessageCallback;
  onMessageSendFail: SendMessageFailedCallback;
  onMessageSendSuccess: SendMessageCallback;
  onReceiveMessage: MessageCallback;
  onDeleteMessage: (params: { messageGroup: MessageGroup }) => void;
  onMessageSuccess: (params: {
    replyId: string;
    localMessageId: string;
  }) => void;
  onMessageError: (params: {
    replyId: string;
    localMessageId: string;
    error: ChatCoreError | undefined;
  }) => void;
  onBeforeMessageGroupListUpdate: (
    messageGroupList: MessageGroup[],
    messages: BuiltInMessage[],
  ) => MessageGroup[];
  onClearContextError: () => void;
  onBeforeLoadMoreInsertMessages: (params: {
    data: GetHistoryMessageResponse;
  }) => void;
  onAfterStopResponding: OnAfterStopRespondingCallback;
  /**
   * @Deprecated temporary use, consider switching implementation later
   */
  onParseReceiveMessageBoxTheme?: OnParseReceiveMessageBoxTheme;
}

export type OnParseReceiveMessageBoxTheme = (param: {
  message: Message<ContentType>;
}) => MessageBoxTheme | undefined;

export type OnAfterStopRespondingCallback = (params: {
  brokenReplyId: string;
  brokenFlattenMessageGroup: BuiltInMessage[] | null;
}) => void;

export interface ChatAreaMessageEventMap {
  onClearHistoryBefore: () => void;
  onClearHistoryAfter: () => void;
  onClearContextBefore: (
    params: ClearMessageContextParams,
  ) => ClearMessageContextParams;
  onClearContextAfter: () => void;
  onSelectionChange: SelectionChangeCallback;
  onInputClick: () => void;
  onOnboardingSelectChange: OnboardingSelectChangeCallback;
  onImageClick: (extra: { url: string }) => void;
  onMessageBottomShow: (message: Message<ContentType>) => void;
  onMessageLinkClick: (
    params: IOnLinkClickParams,
    event: MouseEvent<Element, globalThis.MouseEvent>,
  ) => void;
  onBeforeStopResponding: () => void;
}

export type ChatAreaEventCallback = Partial<ChatAreaLifeCycleEventMap> &
  Partial<ChatAreaMessageEventMap>;
