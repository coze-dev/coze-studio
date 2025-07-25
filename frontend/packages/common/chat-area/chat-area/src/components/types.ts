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
 
import {
  type ComponentType,
  type PropsWithChildren,
  type ReactNode,
} from 'react';

import {
  type IContentConfigs,
  type GetBotInfo,
  type IEventCallbacks,
  type Layout,
} from '@coze-common/chat-uikit-shared';
import { type SuggestedQuestionsShowMode } from '@coze-arch/bot-api/developer_api';

import {
  type MessageMeta,
  type Message,
  type MessageGroup,
  type OnboardingSuggestionItem,
} from '../store/types';
import { type ChatInputIntegrationController } from './chat-input-integration';

export interface MessageBoxUserInfo {
  nickname?: string;
  avatar?: string;
}

export interface MessageBoxProps {
  message: Message;
  meta: MessageMeta;
  isMessageGroupFirstMessage?: boolean;
  isMessageGroupLastMessage?: boolean;
  renderFooter?: (refreshContainerWidth: () => void) => React.ReactNode;
  /** 鼠标悬浮时展示的组件 */
  hoverContent?: React.ReactNode;
  children?: React.ReactNode;
  readonly?: boolean;
  getBotInfo: GetBotInfo;
  layout: Layout;
  showBackground: boolean;
  /**
   * 右上角插槽
   */
  topRightSlot?: React.ReactNode;
  /*
   * 开启图片自适应大小
   */
  enableImageAutoSize?: boolean;
  /**
   * 图片自适应大小容器宽度
   */
  imageAutoSizeContainerWidth?: number;
  eventCallbacks?: IEventCallbacks;
  onError?: (error: unknown) => void;
  isContentLoading?: boolean;
}

export type SendMessageBoxProps = MessageBoxProps;
export type ReceiveMessageBoxProps = MessageBoxProps;

export interface ContentBoxProps {
  message: Message;
  meta: MessageMeta;
  contentConfigs: IContentConfigs;
  getBotInfo: GetBotInfo;
  readonly: boolean;
  eventCallbacks?: IEventCallbacks;
  layout: Layout;
  showBackground: boolean;
  /**
   * 开启图片自适应大小
   */
  enableImageAutoSize?: boolean;
  /**
   * 图片自适应大小容器宽度
   */
  isCardDisabled?: boolean;
  isContentLoading?: boolean;
}

interface MessageContentCommonProps {
  message: Message;
  meta: MessageMeta;
}
type TextMessageContentProps = MessageContentCommonProps;

type CardMessageContentProps = MessageContentCommonProps;

type ImageMessageContentProps = MessageContentCommonProps;

type FileMessageContentProps = MessageContentCommonProps;

export interface ComponentTypesMap {
  messageGroupWrapper: ComponentType<
    PropsWithChildren<{
      replyId?: string;
      messageGroup?: MessageGroup;
      deleteMessageGroup: () => Promise<void>;
      isSendingMessage: boolean;
    }>
  >;
  messageGroupBody: ComponentType<{
    messageGroup: MessageGroup;
    getBotInfo: GetBotInfo;
  }>;
  functionCallMessageBox: ComponentType<{
    functionCallMessageList: Message[];
    /**
     * message 对应的一轮对话是否结束 没被打断 final answer 有返回完毕不管 suggest
     */
    isRelatedChatComplete: boolean;
    /**
     *  message 对应的一轮对话是否为假意打断
     */
    isFakeInterruptAnswer: boolean;
    /**
     * 消息是否来自正在进行的对话，根据responding.replyId判断
     */
    isMessageFromOngoingChat: boolean;
    getBotInfo: GetBotInfo;
  }>;
  messageActionBarFooter: ComponentType<{ refreshContainerWidth: () => void }>;
  messageActionBarHoverContent: ComponentType;
  // TODO: 组件要细化到 message_type 渲染
  receiveMessageBox: ComponentType<ReceiveMessageBoxProps>;
  receiveMessageBoxTopRightSlot: ComponentType;
  sendMessageBox: ComponentType<SendMessageBoxProps>;
  contentBox: ComponentType<ContentBoxProps>;
  textMessageContentBox: ComponentType<TextMessageContentProps>;
  cardMessageContent: ComponentType<CardMessageContentProps>;
  fileMessageContent: ComponentType<FileMessageContentProps>;
  imageMessageContent: ComponentType<ImageMessageContentProps>;

  onboarding: ComponentType<{
    hasMessages: boolean;
    prologue: string;
    suggestions: OnboardingSuggestionItem[];
    onboardingSuggestionsShowMode?: SuggestedQuestionsShowMode;
    sendTextMessage: (messageContent: string) => void;
    name?: string;
    avatar?: string;
    onOnboardingIdChange: (id: string) => void;
    readonly?: boolean;
    enableImageAutoSize?: boolean;
    showBackground?: boolean;
    imageAutoSizeContainerWidth?: number;
    eventCallbacks?: IEventCallbacks;
  }>;
  clearContextIcon: ComponentType;
  /**
   * 输入框整体顶部附加物
   */
  inputAboveOutside: ComponentType;
  /**
   * 输入框内部上方附加物
   */
  inputAddonTop: ComponentType;
  /**
   * 输入框内部右侧插槽
   */
  inputRightActions?: ComponentType;
  chatInputTooltip?: ComponentType;
  chatInputIntegration: {
    renderChatInputSlot?: (
      controller: ChatInputIntegrationController,
    ) => ReactNode;
    renderChatInputTopSlot?: (
      controller: ChatInputIntegrationController,
    ) => ReactNode;
  };
  messageFooterSlot: ComponentType[];
}
