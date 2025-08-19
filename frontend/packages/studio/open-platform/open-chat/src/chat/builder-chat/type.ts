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

import type React from 'react';

import { type ImageModel, type FileModel } from '@coze-common/chat-core';
import { type ContentType } from '@coze-common/chat-area';

import { type OpenUserInfo } from '@/types/user';
import { type DebugProps } from '@/types/props';
import {
  type Layout,
  type FooterConfig,
  type HeaderConfig,
  type FeedbackConfig,
  type ConversationsConfig,
} from '@/types/client';
import { type OnImageClick } from '@/types/';

export interface IWorkflow {
  id?: string;
  parameters?: Record<string, unknown>;
  header?: Record<string, string>;
}
export interface SuggestPromoteInfo {
  customizedSuggestPrompt?: string;

  suggestReplyMode?: number;
}
export interface IProject {
  id: string;
  type: 'app' | 'bot';
  mode: 'draft' | 'release' | 'websdk' | 'audit'; // 草稿模式 | 发布模式 | webSdk发布
  caller?: 'UI_BUILDER' | 'CANVAS';
  connectorId?: string;
  conversationName?: string; // project的话，必须填写
  conversationId?: string; // type 为bot的话，必须填写
  sectionId?: string; // type 为bot的话，必须填写
  name?: string;
  desc?: string;
  defaultName?: string;
  defaultIconUrl?: string;
  iconUrl?: string;
  layout?: Layout;
  version?: string;
  onBoarding?: {
    prologue?: string;
    displayAllSuggest?: boolean;
    suggestions?: string[];
  };
  suggestPromoteInfo?: SuggestPromoteInfo;
}
export interface IEventCallbacks {
  onMessageChanged?: () => void;
  onMessageSended?: () => void;
  onMessageReceivedStart?: () => void;
  onMessageReceivedFinish?: () => void;
  onImageClick?: OnImageClick;
  onGetChatFlowExecuteId?: (id: string) => void;
  onThemeChange?: (theme: 'bg-theme' | 'light') => void;
}
export interface IBuilderChatProps {
  workflow: IWorkflow;
  project: IProject;
  spaceId?: string;
  eventCallbacks?: IEventCallbacks;
  userInfo?: OpenUserInfo;

  areaUi: {
    isDisabled?: boolean; // 默认 false
    uploadable?: boolean; // 默认 true
    isNeedClearContext?: boolean; // 是否显示 clearContext按钮
    isNeedClearMessage?: boolean; // 是否显示 clearMessage按钮
    isNeedAddNewConversation?: boolean; //是否显示新增会话
    isNeedFunctionCallMessage?: boolean;
    isNeedQuote?: boolean;
    feedback?: FeedbackConfig;
    input?: {
      placeholder?: string;
      renderChatInputTopSlot?: (isChatError?: boolean) => React.ReactNode;
      isShow?: boolean; //默认 true
      defaultText?: string;
      isNeedAudio?: boolean; // 是否需要语音输入，默认是false
      isNeedTaskMessage?: boolean;
    };
    header?: HeaderConfig & {
      title?: string;
      icon?: string;
    }; // 默认是
    footer?: FooterConfig;
    conversations?: ConversationsConfig;
    uiTheme?: 'uiBuilder' | 'chatFlow'; // uiBuilder 的主题
    renderLoading?: () => React.ReactNode;
    bgInfo?: {
      imgUrl: string;
      themeColor: string; // 背景颜色
    };
  };
  auth?: {
    type: 'external' | 'internal'; // 内部： cookie换token， 外部： internal
    token?: string;
    refreshToken?: () => Promise<string> | string;
  };
  style?: React.CSSProperties;
  debug?: DebugProps;
}

export type MessageType =
  | {
      type: ContentType.Text;
      text: string;
    }
  | {
      type: ContentType.Image;
      value: ImageModel;
    }
  | {
      type: ContentType.File;
      value: FileModel;
    };

export interface BuilderChatRef {
  sendMessage: (message: MessageType) => void;
  clearContext: () => void;
}
