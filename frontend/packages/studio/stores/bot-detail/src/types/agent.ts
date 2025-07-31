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

import { type PartialRequired } from '@coze-arch/bot-typings/common';
import type { DraftBotApi } from '@coze-arch/bot-api/playground_api';
import type {
  AgentInfo,
  ModelInfo,
  JumpConfig,
  MultiAgentSessionType,
} from '@coze-arch/bot-api/developer_api';
import type {
  LineType,
  WorkflowEdgeJSON,
} from '@flowgram-adapter/free-layout-editor';

import type { BotDetailSkill, BotSuggestionConfig } from './skill';
import type { RequiredBotPrompt } from './persona';

/** Multi agent related data */
export interface BotMultiAgent {
  agents: Agent[];
  edges: WorkflowEdgeJSON[];
  connector_type: LineType;
  /** Use to save bot information for bot type nodes */
  botAgentInfos: DraftBotVo[];
  /**
   * Session takeover configuration
   * Default to flow mode
   */
  chatModeConfig: ChatModeConfig;
}
/** For business use */
export interface AgentBizInfo {
  focused?: boolean;
}

export type Agent = PartialRequired<Omit<AgentInfo, 'work_info'>, 'id'> & {
  prompt: string;
  model: ModelInfo;
  skills: Pick<
    BotDetailSkill,
    'pluginApis' | 'workflows' | 'knowledge' | 'devHooks'
  >;
  system_info_all: Array<RequiredBotPrompt>;
  bizInfo: AgentBizInfo;
  jump_config: JumpConfig;
  suggestion: BotSuggestionConfig;
};

/** In the bot information returned by the api, some fields are json, and this type is the parse type. */
export type DraftBotVo = Omit<DraftBotApi, 'work_info'> & {
  work_info: {
    suggest_reply: BotSuggestionConfig;
  };
};

export type ChatModeConfig =
  | {
      /** Session takeover */
      type: MultiAgentSessionType.Flow;
    }
  | {
      /** Session takeover */
      type: MultiAgentSessionType.Host;
      /** Current host node id */
      currentHostId: string;
    };

export interface MultiSheetViewOpenState {
  left: boolean;
  right: boolean;
}
