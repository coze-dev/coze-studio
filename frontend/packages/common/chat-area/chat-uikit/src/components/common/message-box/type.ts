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
 * style theme
 * @Deprecated Consider alternative implementations, currently not flexible enough
 */
export type MessageBoxTheme =
  /** theme color */
  | 'primary'
  /** White Background */
  | 'whiteness'
  /**
   * Grey background
   */
  | 'grey'
  /** Colorful base colors for home use */
  | 'colorful'
  /** Official notice with colored borders */
  | 'color-border'
  /** Official notice, with colored borders, but no padding. */
  | 'color-border-card'
  | 'border'
  | 'none';

interface MessageBoxBasicProps {
  /**
   * user information
   */
  senderInfo: {
    userUniqueName?: string;
    nickname?: string;
    url?: string;
    id: string;
    userLabel?: UserLabelInfo | null;
  };
  /**
   * Message ID
   */
  messageId: string | null;

  showUserInfo?: boolean;
  /**
   * theme
   */
  theme?: MessageBoxTheme;
  /**
   * Insert the footer of the message
   */
  renderFooter?: (refreshContainerWidth: () => void) => React.ReactNode;
  /** Components displayed while the mouse is hovering */
  hoverContent?: ReactNode;
  /**
   * Left Slot
   */
  right?: React.ReactNode;
  /**
   * Upper right slot
   */
  topRightSlot?: React.ReactNode;
  getBotInfo: GetBotInfo;
  /**
   * Is it a mobile end?
   */
  layout?: Layout;
  classname?: string;

  messageBubbleWrapperClassname?: string;
  messageBoxWraperClassname?: string; // Direct father style of message box
  messageBubbleClassname?: string; // Message The style of the message bubble
  messageErrorWrapperClassname?: string; // Message wrong father style
  isHoverShowUserInfo?: boolean; // Whether to display user details when hovering

  showBackground?: boolean;
  /**
   * Container dynamic width for dynamically calculating image dimensions
   */
  imageAutoSizeContainerWidth?: number;
  /**
   * Whether to enable picture adaptation mode
   */
  enableImageAutoSize?: boolean;
  /**
   * event callback
   */
  eventCallbacks?: IEventCallbacks;
  /**
   * Response to JS Error
   */
  onError?: (error: unknown) => void;
}

/** It's just a shell, the content is presented by children */
export interface MessageBoxShellProps extends MessageBoxBasicProps {
  children: React.ReactNode;
}

/** MessageBox with full built-in implementation */
export interface NormalMessageBoxProps extends MessageBoxBasicProps {
  /**
   * message body
   */
  message: IMessage;
  /**
   * Required parameters for the file
   */
  contentConfigs?: IContentConfigs;
  /** style theme */
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

  /** Components displayed while the mouse is hovering */
  hoverContent?: React.ReactNode;
  right?: React.ReactNode;
  /**
   * Upper right slot
   */
  topRightSlot?: React.ReactNode;
  messageId: string | null;
  senderId: string;
  layout: Layout;
  contentTime: number | undefined;
  classname?: string;

  messageBoxWraperClassname?: string; // Direct father style of message box
  messageBubbleClassname?: string; // Message The style of the message bubble
  messageBubbleWrapperClassname?: string; // Message message bubble father style
  messageErrorWrapperClassname?: string; // Message wrong father style
  isHoverShowUserInfo?: boolean; // Whether to display user details when hovering

  showBackground?: boolean;
  extendedUserInfo?: {
    userLabel?: UserLabelInfo | null;
    userUniqueName?: string;
  };
  /**
   * Container dynamic width for dynamically calculating image dimensions
   */
  imageAutoSizeContainerWidth?: number;
  /**
   * Whether to enable picture adaptation mode
   */
  enableImageAutoSize?: boolean;
  eventCallbacks?: IEventCallbacks;
  /**
   * Response to JS Error
   */
  onError?: (error: unknown) => void;
}
