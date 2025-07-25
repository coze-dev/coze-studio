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

/** multi agent 相关数据 */
export interface BotMultiAgent {
  agents: Agent[];
  edges: WorkflowEdgeJSON[];
  connector_type: LineType;
  /** 用于保存 bot 类型节点的 bot 信息 */
  botAgentInfos: DraftBotVo[];
  /**
   * 会话接管方式配置
   * 默认为 flow 模式
   */
  chatModeConfig: ChatModeConfig;
}
/** 业务用到的 */
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

/** api 返回的 bot 信息中，部分字段是 json，本类型是 parse 后的类型 */
export type DraftBotVo = Omit<DraftBotApi, 'work_info'> & {
  work_info: {
    suggest_reply: BotSuggestionConfig;
  };
};

export type ChatModeConfig =
  | {
      /** 会话接管方式 */
      type: MultiAgentSessionType.Flow;
    }
  | {
      /** 会话接管方式 */
      type: MultiAgentSessionType.Host;
      /** 当前的 host 节点 id */
      currentHostId: string;
    };

export interface MultiSheetViewOpenState {
  left: boolean;
  right: boolean;
}
