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

import { type MockHitStatus } from '@coze-arch/bot-api/debugger_api';
import { type Layout } from '@coze-common/chat-uikit-shared';

import { type Message } from '../../store/types';

// TODO: 需要和服务端对接

export type MessageExt = Message['extra_info'];
export enum MessageUnitRole {
  DATA_SET = 'dataSet',
  VERBOSE = 'verbose', //新版debug协议。例如：agent节点跳转
  TOOL = 'tool',
  HOOKS = 'hooks',
}

export interface BaseMessageUnit {
  timeIndexMark?: number;
  time?: string;
  tokens?: number;
  agentID?: string;
  agentName?: string;
}

export interface FunctionCallMessageUnit extends BaseMessageUnit {
  role: MessageUnitRole;
  llmOutput: Message;
  apiResponse?: Message;
  apiIndexMark?: number;
  // stream的uuid
  streamUuid?: string;
  // 流式插件的response需要verbose进行更新
  isFinish?: boolean;
  // function_call和tool_response匹配的id，通用方案
  callId?: string;
}

export interface MockHitInfo {
  hitStatus?: MockHitStatus;
  mockSetName?: string;
}

export interface CollapsePanelHeaderProps {
  messageUnit: FunctionCallMessageUnit;
  isTopLevelOfTheNestedPanel: boolean;
  isPanelOpen?: boolean;

  /**
   * message 对应的一轮对话中所有工具是否调用成功
   */
  isRelatedChatAllFunctionCallSuccess: boolean;

  /**
   * message 对应的一轮对话是否结束 没被打断 final answer 有返回完毕
   */
  isRelatedChatComplete: boolean;

  /**
   * 是不是有关对话的最后一条 function call 消息
   */
  isLatestFunctionCallOfRelatedChat: boolean;

  /**
   * 这条 message 是否来自正在进行的对话
   */
  isMessageFromOngoingChat: boolean;
  /**
   * 这组消息 是否是假意打断场景
   */
  isFakeInterruptAnswer: boolean;
  /**
   * 是否可展开
   */
  expandable: boolean;

  /*
   * function call 是否命中 mockset
   */
  hitMockSet?: boolean;
  /**
   * 是否是移动端
   */
  layout?: Layout;
}

export type ProcessStatus =
  | 'fail'
  | 'default'
  | 'loading'
  | 'success'
  | 'interrupt';

export interface THeaderConfig {
  icon: ReactNode;
  title: ReactNode;
  status: ProcessStatus;
}

// 接口返回结构
export interface ExecuteDisplayName {
  name_executed: string;
  name_execute_failed: string;
  name_executing: string;
}

export interface HooksCallVerboseData {
  type: string;
  uri: string;
  log_id: string;
}
