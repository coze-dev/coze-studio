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

import { nanoid } from 'nanoid';
import { omit } from 'lodash-es';
import {
  type Agent as AgentFromPlayground,
  type BotOptionData,
  AgentType,
  type DraftBotApi,
  type MultiAgentInfo,
  MultiAgentSessionType,
  type UpdateAgentV2Request,
  ReferenceUpdateType,
} from '@coze-arch/bot-api/playground_api';
import { LineType } from '@flowgram-adapter/free-layout-editor';

import { useModelStore } from '../model';
import { useBotSkillStore } from '../bot-skill';
import { findFirstAgentId } from '../../utils/find-agent';
import type { BotSuggestionConfig } from '../../types/skill';
import type { Agent, BotMultiAgent, DraftBotVo } from '../../types/agent';
import { DEFAULT_AGENT_BIZ_INFO, DEFAULT_AGENT_DESCRIPTION } from './defaults';
export const transformDto2Vo = {
  agent: (botOpts?: BotOptionData, data?: AgentFromPlayground): Agent => {
    const { transformDto2Vo: transformDto2Vo4BotSkill } =
      useBotSkillStore.getState();
    const { transformDto2Vo: transformDto2Vo4Model } = useModelStore.getState();
    const model = transformDto2Vo4Model({
      bot_info: {
        model_info: data?.model_info,
      },
      bot_option_data: botOpts,
    });

    const prompt = data?.prompt_info?.prompt ?? '';

    const pluginApis = transformDto2Vo4BotSkill.plugin(
      data?.plugin_info_list,
      botOpts?.plugin_detail_map,
      botOpts?.plugin_api_detail_map,
    );

    const workflows = transformDto2Vo4BotSkill.workflow(
      data?.workflow_info_list,
      botOpts?.workflow_detail_map,
    );
    const knowledge = transformDto2Vo4BotSkill.knowledge(
      data?.knowledge,
      botOpts?.knowledge_detail_map,
    );

    const devHooks = transformDto2Vo4BotSkill.hookInfo(data?.hook_info);

    return {
      id: data?.agent_id ?? '',
      reference_id: data?.reference_id,
      reference_info_status: data?.reference_info_status,
      update_type: data?.update_type,
      agent_type: data?.agent_type,
      name: data?.agent_name,
      position: data?.agent_position,
      model,
      prompt,
      description: data?.description || DEFAULT_AGENT_DESCRIPTION(),
      // Default business state bizInfo
      bizInfo: DEFAULT_AGENT_BIZ_INFO(),
      system_info_all: [],
      skills: {
        pluginApis,
        workflows,
        knowledge,
        ...(devHooks ? { devHooks } : {}),
      },
      current_version: data?.current_version,
      suggestion: data?.suggest_reply_info as unknown as BotSuggestionConfig,
      intents: data?.intents || [],
      jump_config: data?.jump_config || {},
      ...(data?.agent_type === AgentType.Global_Agent && {
        intents: data.intents?.length
          ? data.intents
          : [{ intent_id: nanoid() }],
      }),
    };
  },
  botNodeInfo: (bot: DraftBotApi): DraftBotVo => {
    const { transformDto2Vo: transformDto2Vo4BotSkill } =
      useBotSkillStore.getState();
    return {
      ...bot,
      work_info: {
        suggest_reply: transformDto2Vo4BotSkill.suggestionConfig(
          bot.suggest_reply,
          true,
        ),
      },
    };
  },
  multiAgent: ({
    agents,
    multiInfo,
    botOpts,
  }: {
    agents?: AgentFromPlayground[];
    multiInfo?: MultiAgentInfo;
    botOpts?: BotOptionData;
  }): BotMultiAgent => {
    const transformedAgents =
      agents?.map(item => transformDto2Vo.agent(botOpts, item)) || [];

    const tempEdges = transformedAgents?.flatMap(
      agent =>
        agent.intents?.map(intent => ({
          sourceNodeID: agent.id,
          targetNodeID: intent.next_agent_id || '',
          sourcePortID: intent.intent_id,
        })) || [],
    );

    return {
      edges: tempEdges,
      connector_type: (multiInfo?.connector_type ??
        LineType.BEZIER) as LineType,
      agents: transformedAgents,
      botAgentInfos: [],
      chatModeConfig:
        multiInfo?.session_type === MultiAgentSessionType.Host
          ? {
              type: multiInfo.session_type,
              currentHostId:
                findFirstAgentId({
                  agents: transformedAgents,
                }) || '',
            }
          : { type: MultiAgentSessionType.Flow },
    };
  },
};

export const transformVo2Dto = {
  agent: (targetAgent: Agent): Omit<UpdateAgentV2Request, 'bot_id'> => {
    const { transformVo2Dto: transformVo2Dto4BotSkill } =
      useBotSkillStore.getState();
    const { transformVo2Dto: transformVo2Dto4Model } = useModelStore.getState();

    return {
      ...omit(targetAgent, [
        'skills',
        'system_info_all',
        'prompt',
        'bizInfo',
        'jump_config',
        'model',
        'suggestion',
      ]),

      plugin_info_list: transformVo2Dto4BotSkill.plugin(
        targetAgent?.skills?.pluginApis,
      ),
      workflow_info_list: transformVo2Dto4BotSkill.workflow(
        targetAgent?.skills?.workflows,
      ),
      knowledge: transformVo2Dto4BotSkill.knowledge(
        targetAgent?.skills?.knowledge,
      ),
      suggest_reply_info: transformVo2Dto4BotSkill.suggestionConfig(
        targetAgent?.suggestion,
      ),
      hook_info: targetAgent?.skills?.devHooks,
      model_info: transformVo2Dto4Model(targetAgent?.model),
      prompt_info: {
        prompt: targetAgent.prompt,
      },
      jump_config: targetAgent.jump_config,

      current_version:
        targetAgent.update_type === ReferenceUpdateType.AutoUpdate
          ? // If the current agent is automatically updated, set the current_version to "0"
            '0'
          : targetAgent.current_version,
    };
  },
};
