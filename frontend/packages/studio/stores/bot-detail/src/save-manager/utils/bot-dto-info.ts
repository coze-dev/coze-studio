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

import { merge } from 'lodash-es';
import {
  REPORT_EVENTS as ReportEventNames,
  createReportEvent,
} from '@coze-arch/report-events';
import {
  type VoicesInfo,
  type BotInfoForUpdate,
} from '@coze-arch/idl/playground_api';
import { BotMode } from '@coze-arch/bot-api/developer_api';

import { type RemoveOptional, type UnionUndefined } from '@/types/utils';
import { useQueryCollectStore } from '@/store/query-collect';
import { usePersonaStore } from '@/store/persona';
import { useMultiAgentStore } from '@/store/multi-agent';
import { useModelStore } from '@/store/model';
import { useBotSkillStore } from '@/store/bot-skill';
import { useBotInfoStore } from '@/store/bot-info';

export const getBotDetailDtoInfo = () => {
  const { mode } = useBotInfoStore.getState();
  const botSkill = useBotSkillStore.getState();
  const multiAgent = useMultiAgentStore.getState();
  const model = useModelStore.getState();
  const persona = usePersonaStore.getState();
  const queryCollect = useQueryCollectStore.getState();

  const isMulti = mode === BotMode.MultiMode;
  const {
    knowledge,
    variables,
    workflows,
    taskInfo,
    suggestionConfig,
    onboardingContent,
    pluginApis,
    backgroundImageInfoList,
    shortcut,
    tts,
    timeCapsule,
    filebox,
    devHooks,
    voicesInfo,
  } = botSkill;

  const { agents } = multiAgent;

  const reportEvent = createReportEvent({
    eventName: ReportEventNames.botDebugSaveAll,
  });

  try {
    const botSkillInfo: Omit<BotInfoForUpdate, 'voices_info'> & {
      voices_info: UnionUndefined<RemoveOptional<VoicesInfo>>;
    } = {
      prompt_info: persona.transformVo2Dto(persona.systemMessage),
      model_info: model.transformVo2Dto(model.config),
      plugin_info_list: isMulti
        ? undefined
        : botSkill.transformVo2Dto.plugin(pluginApis),
      workflow_info_list: isMulti
        ? undefined
        : botSkill.transformVo2Dto.workflow(workflows),
      knowledge: isMulti
        ? undefined
        : botSkill.transformVo2Dto.knowledge(knowledge),
      variable_list: botSkill.transformVo2Dto.variables(variables),
      task_info: botSkill.transformVo2Dto.task(taskInfo),
      suggest_reply_info:
        botSkill.transformVo2Dto.suggestionConfig(suggestionConfig),
      onboarding_info: botSkill.transformVo2Dto.onboarding(onboardingContent),
      background_image_info_list: backgroundImageInfoList,
      shortcut_sort: botSkill.transformVo2Dto.shortcut(shortcut),
      // @ts-expect-error fix me late
      voices_info: merge(
        {},
        botSkill.transformVo2Dto.tts(tts),
        botSkill.transformVo2Dto.voicesInfo(voicesInfo),
      ),
      bot_tag_info: botSkill.transformVo2Dto.timeCapsule(timeCapsule),
      filebox_info: botSkill.transformVo2Dto.filebox(filebox),
      hook_info: isMulti ? undefined : devHooks,
      user_query_collect_conf: queryCollect.transformVo2Dto(queryCollect),
      agents: isMulti
        ? agents.map(item => multiAgent.transformVo2Dto.agent(item))
        : undefined,
    };

    reportEvent.success();

    return { botSkillInfo };
  } catch (e) {
    reportEvent.error({
      reason: 'bot debug save all fail',
      error: e instanceof Error ? e : void 0,
    });
    return {};
  }
};
