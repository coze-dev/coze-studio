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

import { type Agent } from '@coze-studio/bot-detail-store';
import { type Dataset, FormatType } from '@coze-arch/bot-api/knowledge';
import {
  type Model,
  ModelFuncConfigStatus,
  ModelFuncConfigType,
  RecognitionMode,
} from '@coze-arch/bot-api/developer_api';

interface AgentModelFuncConfigCheckContext {
  // The dataset in the agent may lack meta information and require a way to obtain the complete data
  getDatasetById: (id: string) => Dataset | undefined;
  config: Model['func_config'];
}

type GetAgentHasValidDataByFuncConfigType = (
  agent: Agent,
  context: AgentModelFuncConfigCheckContext,
) => boolean;

const getAgentHasValidDataMethodMap: {
  [key in ModelFuncConfigType]?: GetAgentHasValidDataByFuncConfigType;
} = {
  [ModelFuncConfigType.KnowledgeText]: (agent, { getDatasetById }) =>
    !!agent.skills.knowledge.dataSetList?.some(
      item =>
        (getDatasetById(item.dataset_id ?? '') ?? item).format_type ===
        FormatType.Text,
    ),
  [ModelFuncConfigType.KnowledgeTable]: (agent, { getDatasetById }) =>
    !!agent.skills.knowledge.dataSetList?.some(
      item =>
        (getDatasetById(item.dataset_id ?? '') ?? item).format_type ===
        FormatType.Table,
    ),
  [ModelFuncConfigType.KnowledgePhoto]: (agent, { getDatasetById }) =>
    !!agent.skills.knowledge.dataSetList?.some(
      item =>
        (getDatasetById(item.dataset_id ?? '') ?? item).format_type ===
        FormatType.Image,
    ),
  [ModelFuncConfigType.KnowledgeAutoCall]: agent =>
    !!agent.skills.knowledge.dataSetInfo.auto,
  [ModelFuncConfigType.KnowledgeOnDemandCall]: agent =>
    !agent.skills.knowledge.dataSetInfo.auto,
  [ModelFuncConfigType.Plugin]: agent => agent.skills.pluginApis.length > 0,
  [ModelFuncConfigType.Workflow]: agent => agent.skills.workflows.length > 0,
  [ModelFuncConfigType.MultiAgentRecognize]: agent =>
    agent.jump_config.recognition === RecognitionMode.FunctionCall,
};

export const agentModelFuncConfigCheck = ({
  config,
  agent,
  context,
}: {
  config: Model['func_config'];
  agent: Agent;
  context: AgentModelFuncConfigCheckContext;
}) => {
  if (!config) {
    return { poorSupported: [], notSupported: [] };
  }
  const poorSupported: ModelFuncConfigType[] = [];
  const notSupported: ModelFuncConfigType[] = [];
  Object.entries(config).forEach(([type, status]) => {
    const hasValidData = getAgentHasValidDataMethodMap[
      type as unknown as ModelFuncConfigType
    ]?.(agent, context);
    if (hasValidData) {
      if (status === ModelFuncConfigStatus.NotSupport) {
        notSupported.push(type as unknown as ModelFuncConfigType);
      }
      if (status === ModelFuncConfigStatus.PoorSupport) {
        poorSupported.push(type as unknown as ModelFuncConfigType);
      }
    }
  });

  return { poorSupported, notSupported };
};
