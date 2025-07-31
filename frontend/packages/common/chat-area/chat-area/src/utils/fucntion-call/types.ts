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

// TODO: Needs to interface with server level

export type MessageExt = Message['extra_info'];
export enum MessageUnitRole {
  DATA_SET = 'dataSet',
  VERBOSE = 'verbose', //New debug protocol. For example: agent node jump
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
  // Streaming uuid
  streamUuid?: string;
  // Streaming plugin responses need to be updated verbose
  isFinish?: boolean;
  // function_call and tool_response matching IDs, common scheme
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
   * Whether all tools in the conversation corresponding to the message were called successfully
   */
  isRelatedChatAllFunctionCallSuccess: boolean;

  /**
   * Whether the conversation corresponding to the message is over and not interrupted, the final answer has been returned
   */
  isRelatedChatComplete: boolean;

  /**
   * Is it the last function call message about the conversation?
   */
  isLatestFunctionCallOfRelatedChat: boolean;

  /**
   * Is this message from an ongoing conversation?
   */
  isMessageFromOngoingChat: boolean;
  /**
   * Is this set of messages pretending to interrupt the scene?
   */
  isFakeInterruptAnswer: boolean;
  /**
   * Can it be expanded?
   */
  expandable: boolean;

  /*
   * Function call hits mockset
   */
  hitMockSet?: boolean;
  /**
   * Is it a mobile end?
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

// interface return structure
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
