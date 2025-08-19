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

import { type OpenApiSource } from '@/types/open';
import type { Language } from '@/types/i18n';

import { type OpenUserInfo } from './user';
export enum Layout {
  PC = 'pc',
  MOBILE = 'mobile',
}

export interface FeedbackTag {
  label: string;
  isNeedDetail?: boolean;
}

export interface FeedbackConfig {
  isNeedFeedback?: boolean; // 默认是false
  feedbackPanel?: {
    title?: string;
    placeholder?: string;
    tags?: FeedbackTag[];
  };
}
interface BaseUiProps {
  icon?: string; // 助手的图标url，用于小助手按钮显示，以及页面logo显示
  layout?: Layout;
  lang?: Language;
  zIndex?: number;
}
export interface HeaderConfig {
  isShow?: boolean; //是否显示header， 默认是true
  isNeedClose?: boolean; //是否需要关闭按钮， 默认是true
  extra?: ReactNode | false; // 用于站位的，默认无
}

export interface ConversationsConfig {
  isNeed?: boolean; // 默认值 false
}
interface ChatBotUiProps {
  title?: string;
  uploadable?: boolean;
  isNeedClearContext?: boolean; // 是否需要清除上下文，默认 为true
  isNeedClearMessage?: boolean; //是否需要删除消息，默认是true
  isNeedAddNewConversation?: boolean; // 是否需要添加会话按钮
  isNeedAudio?: boolean; // 是否需要音色。默认是true
  isNeedFunctionCallMessage?: boolean; //默认是true
  isNeedQuote?: boolean; // 默认是 false
  isNeedConversationAdd?: boolean; // 是否需要会话添加，同时有会话列表的功能，默认是 false
  feedback?: FeedbackConfig; //
  // 仅影响chat框的外部框架，不影响内部显示的属性
  width?: number;
  el?: HTMLElement;
  onHide?: () => void; // 当chat聊天框隐藏时，触发该事件
  onShow?: () => void; // 当chat聊天框显示时，触发该事件
  onBeforeShow?: () => Promise<boolean> | boolean; // 显示聊天框前调用，如果用户返回了 false，则不显示聊天框
  onBeforeHide?: () => Promise<boolean> | boolean; // 隐藏聊天框前调用，如果用户返回了 false，则不隐藏聊天框
}
export enum ChatType {
  BOT = 'bot',
  APP = 'app',
}
export interface AppInfo {
  appId: string;
  workflowId: string;
  conversationName?: string;
  parameters?: Record<string, unknown>;
  version?: string;
}
export interface BotInfo {
  botId?: string;
  parameters?: Record<string, unknown>;
}
//
export interface FooterConfig {
  isShow?: boolean; //是否显示
  expressionText?: string; // 例如 由{{name}}提供。
  linkvars?: Record<
    string,
    {
      text: string;
      link: string;
    }
  >;
}
export interface CozeChatConfig {
  type?: ChatType; // 默认是bot
  bot_id?: string;
  appInfo?: AppInfo;
  botInfo?: BotInfo;
  source: OpenApiSource;
  extra?: {
    webChat: Record<string, string>;
  };
  auth?: AuthProps;
  ui?: {
    base?: Pick<BaseUiProps, 'icon' | 'lang' | 'layout'>;
    chatBot?: Pick<
      ChatBotUiProps,
      | 'title'
      | 'uploadable'
      | 'isNeedClearContext'
      | 'isNeedClearMessage'
      | 'isNeedAddNewConversation'
      | 'isNeedAudio'
      | 'isNeedFunctionCallMessage'
      | 'isNeedQuote'
      | 'feedback'
    >;
    footer?: FooterConfig;
    header?: HeaderConfig;
    conversations?: ConversationsConfig;
  };
  // open SDk生成的，不能外部传入
  conversation_id: string;
}

interface ChatComponentProps {
  layout: Layout;
  lang: Language;
  title: string;
  icon: string;
  zIndex: number;
  uploadable: boolean;
  width: number;
}

/** @deprecated 后续会弃用 */
export type ComponentProps = Partial<ChatComponentProps>;

/** 鉴权相关类型 */
export enum AuthType {
  UNAUTH = 'unauth', // 无需鉴权
  TOKEN = 'token', // 通过函数获取token
}

export interface AuthProps {
  type?: AuthType;
  /*
   * type == refresh_token, 用户需传入token、refreshToken参数
   */
  token?: string; // 用户可主动传入token
  /*
   * type == TOKEN_BY_FUNC, token过期或者无token时，会触发该事件，需要用户传入新的token
   */
  onRefreshToken?: (token?: string) => Promise<string> | string;
  connectorId?: string;
}

export interface UiProps {
  base?: BaseUiProps;
  asstBtn?: {
    isNeed?: boolean; // 默认值是true
  };
  chatBot?: ChatBotUiProps;
  footer?: FooterConfig;
  header?: HeaderConfig;
  conversations?: ConversationsConfig;
}

export enum IframeMessageEvent {
  GET_IFRAME_PARAMS = 'GET_IFRAME_PARAMS',
  GET_NEW_TOKEN = 'GET_NEW_TOKEN',
  THEME_CHANGE = 'THEME_CHANGE',
}

// 双方通信传递的数据结构
export interface IframeParams {
  // 通信标识
  // iframe回传父页面 的事件前缀 => 用于父级页面的 多实例 区分 message 来源
  chatClientId: string;
  chatConfig: CozeChatConfig;
  userInfo?: OpenUserInfo;
}

export enum WebSdkError {
  // 超时
  TIMEOUT = -1,
  // 未知错误
  UNKNOWN = -2,
  // 禁止操作
  FORBIDDEN = -3,

  // 未知错误
  SUCCESS = 0,

  // 鉴权失败
  AUTH_FAILED = 100001,
  // token拉取失败
  AUTH_TOKEN_GET_FAILED = 100002,
}
