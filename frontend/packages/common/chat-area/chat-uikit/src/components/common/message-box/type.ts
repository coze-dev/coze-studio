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
 
import { type ReactNode } from 'react';

import {
  type IEventCallbacks,
  type Layout,
  type IContentConfigs,
  type IMessage,
  type GetBotInfo,
} from '@coze-common/chat-uikit-shared';

import { type UserLabelInfo } from '../user-label';

/**
 * 样式主题
 * @deprecated 考虑替换实现方式，目前使用不够灵活
 */
export type MessageBoxTheme =
  /** 主题色 */
  | 'primary'
  /** 白色背景 */
  | 'whiteness'
  /**
   * 灰色背景
   */
  | 'grey'
  /** home用的炫彩底色 */
  | 'colorful'
  /** 官方通知，有彩色边框 */
  | 'color-border'
  /** 官方通知，有彩色边框，但是不留 padding */
  | 'color-border-card'
  | 'border'
  | 'none';

interface MessageBoxBasicProps {
  /**
   * 用户信息
   */
  senderInfo: {
    userUniqueName?: string;
    nickname?: string;
    url?: string;
    id: string;
    userLabel?: UserLabelInfo | null;
  };
  /**
   * 消息 id
   */
  messageId: string | null;

  showUserInfo?: boolean;
  /**
   * 主题
   */
  theme?: MessageBoxTheme;
  /**
   * 插入消息的footer
   */
  renderFooter?: (refreshContainerWidth: () => void) => React.ReactNode;
  /** 鼠标悬浮时展示的组件 */
  hoverContent?: ReactNode;
  /**
   * 左侧插槽
   */
  right?: React.ReactNode;
  /**
   * 右上角插槽
   */
  topRightSlot?: React.ReactNode;
  getBotInfo: GetBotInfo;
  /**
   * 是否是移动端
   */
  layout?: Layout;
  classname?: string;

  messageBubbleWrapperClassname?: string;
  messageBoxWraperClassname?: string; // message box的直接父亲样式
  messageBubbleClassname?: string; // message消息气泡的样式
  messageErrorWrapperClassname?: string; // message错误的父亲样式
  isHoverShowUserInfo?: boolean; // hover的时候是否显示用户详细信息

  showBackground?: boolean;
  /**
   * 容器动态宽度，用于动态计算图片尺寸
   */
  imageAutoSizeContainerWidth?: number;
  /**
   * 是否启用图片自适应模式
   */
  enableImageAutoSize?: boolean;
  /**
   * 事件回调
   */
  eventCallbacks?: IEventCallbacks;
  /**
   * 针对 JS Error 的响应
   */
  onError?: (error: unknown) => void;
}

/** 只是套壳，内容由 children 呈现 */
export interface MessageBoxShellProps extends MessageBoxBasicProps {
  children: React.ReactNode;
}

/** 含有完整内置实现的 MessageBox */
export interface NormalMessageBoxProps extends MessageBoxBasicProps {
  /**
   * 消息体
   */
  message: IMessage;
  /**
   * 文件需要用到的必备参数
   */
  contentConfigs?: IContentConfigs;
  /** 样式主题 */
  theme?: MessageBoxTheme;
  footer?: ReactNode;
  readonly?: boolean;
  isContentLoading?: boolean;
  isCardDisabled?: boolean;
}

export type MessageBoxProps = MessageBoxShellProps | NormalMessageBoxProps;

export interface MessageBoxWrapProps {
  nickname?: string;
  avatar?: string;
  theme: MessageBoxTheme;
  showUserInfo?: boolean;
  renderFooter?: (refreshContainerWidth: () => void) => React.ReactNode;

  /** 鼠标悬浮时展示的组件 */
  hoverContent?: React.ReactNode;
  right?: React.ReactNode;
  /**
   * 右上角插槽
   */
  topRightSlot?: React.ReactNode;
  messageId: string | null;
  senderId: string;
  layout: Layout;
  contentTime: number | undefined;
  classname?: string;

  messageBoxWraperClassname?: string; // message box的直接父亲样式
  messageBubbleClassname?: string; // message消息气泡的样式
  messageBubbleWrapperClassname?: string; // message消息气泡的父亲样式
  messageErrorWrapperClassname?: string; // message错误的父亲样式
  isHoverShowUserInfo?: boolean; // hover的时候是否显示用户详细信息

  showBackground?: boolean;
  extendedUserInfo?: {
    userLabel?: UserLabelInfo | null;
    userUniqueName?: string;
  };
  /**
   * 容器动态宽度，用于动态计算图片尺寸
   */
  imageAutoSizeContainerWidth?: number;
  /**
   * 是否启用图片自适应模式
   */
  enableImageAutoSize?: boolean;
  eventCallbacks?: IEventCallbacks;
  /**
   * 针对 JS Error 的响应
   */
  onError?: (error: unknown) => void;
}
