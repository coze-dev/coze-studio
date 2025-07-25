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

import {
  type ChatFrameworkProps,
  type IMessageCallback,
  type RawMessage,
  type IChatFlowProps,
  type FooterConfig,
  type IOnImageClickEvent,
} from '@coze/chat-sdk';

import { type Layout, type DebugProps, type HeaderConfig } from './base';
export interface IWorkflow {
  id?: string;
  parameters?: Record<string, unknown>;
  header?: Record<string, string>;
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
  defaultName?: string;
  defaultIconUrl?: string;
  iconUrl?: string;
  layout?: Layout;
  version?: string;
  onBoarding?: {
    prologue: string;
    suggestions: string[];
  };
}
export interface IEventCallbacks {
  onMessageChanged?: () => void;
  onMessageSended?: () => void;
  onMessageReceivedStart?: () => void;
  onMessageRecievedFinish?: () => void;
  onImageClick?: IOnImageClickEvent;
  onGetChatFlowExecuteId?: (id: string) => void;
  onThemeChange?: (theme: 'bg-theme' | 'light') => void;
  afterMessageReceivedFinish?: IMessageCallback['afterMessageReceivedFinish'];
  onInitSuccess?: () => void;
}
export interface IBuilderChatProps {
  workflow: IWorkflow;
  project: IProject;
  eventCallbacks?: IEventCallbacks;
  userInfo: IChatFlowProps['userInfo'];
  areaUi: {
    isDisabled?: boolean; // 默认 false
    uploadable?: boolean; // 默认 true
    isNeedClearContext?: boolean; // 是否显示 clearContext按钮
    isNeedClearMessage?: boolean; // 是否显示 clearMessage按钮

    //isShowHeader?: boolean; // 默认 false
    //isShowFooter?: boolean; // 默认 false
    input?: {
      placeholder?: string;
      renderChatInputTopSlot?: (isChatError?: boolean) => React.ReactNode;
      isShow?: boolean; //默认 true
      defaultText?: string;
      isNeedAudio?: boolean; // 是否需要语音输入，默认是false
      isNeedTaskMessage?: boolean;
    };
    header?: HeaderConfig; // 默认是
    footer?: FooterConfig;
    uiTheme?: 'uiBuilder' | 'chatFlow'; // uiBuilder 的主题
    renderLoading?: () => React.ReactNode;
  };
  auth?: {
    type: 'external' | 'internal'; // 内部： cookie换token， 外部： internal
    token?: string;
    refreshToken?: () => Promise<string> | string;
  };
  style?: React.CSSProperties;
  debug?: DebugProps;
  setting?: Partial<ChatFrameworkProps['setting']>;
}

export interface BuilderChatRef {
  sendMessage: (message: RawMessage) => void;
}
