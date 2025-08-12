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
  mode: 'draft' | 'release' | 'websdk' | 'audit'; // Draft Mode | Publish Mode | webSdk Publish
  caller?: 'UI_BUILDER' | 'CANVAS';
  connectorId?: string;
  conversationName?: string; // Project must be filled in
  conversationId?: string; // If the type is bot, it must be filled in
  sectionId?: string; // If the type is bot, it must be filled in
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
    isDisabled?: boolean; // Default false
    uploadable?: boolean; // Default true
    isNeedClearContext?: boolean; // Whether to display the clearContext button
    isNeedClearMessage?: boolean; // Whether to display the clearMessage button

    //isShowHeader?: boolean;//default false
    //isShowFooter?: boolean;//default false
    input?: {
      placeholder?: string;
      renderChatInputTopSlot?: (isChatError?: boolean) => React.ReactNode;
      isShow?: boolean; //Default true
      defaultText?: string;
      isNeedAudio?: boolean; // Whether voice input is required, the default is false
      isNeedTaskMessage?: boolean;
    };
    header?: HeaderConfig; // Default is
    footer?: FooterConfig;
    uiTheme?: 'uiBuilder' | 'chatFlow'; // Theme for uiBuilder
    renderLoading?: () => React.ReactNode;
  };
  auth?: {
    type: 'external' | 'internal'; // Internal: cookie for token, external: internal
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
