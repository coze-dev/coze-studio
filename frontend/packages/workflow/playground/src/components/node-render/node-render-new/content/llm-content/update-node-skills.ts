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

import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type LLMNodeDataSkill,
  WorkflowNodeData,
  LLMNodeDataSkillType,
  type LLMNodeDataWorkflowSkill,
  type LLMNodeDataPluginSkill,
  type LLMNodeDataDatasetSkill,
} from '@coze-workflow/nodes';
import {
  type GetLLMNodeFCSettingDetailResponse,
  type StandardNodeType,
} from '@coze-workflow/base';

import { type BoundSkills } from '@/nodes-v2/llm/skills/types';

/**
 * Cache a skill name and icon data on the node
 * @param node
 * @param fcParam
 * @param skillsDetail
 * @returns
 */
export function updateNodeSkills(
  node: WorkflowNodeEntity,
  fcParam: BoundSkills,
  skillsDetail: GetLLMNodeFCSettingDetailResponse | undefined,
): void {
  if (!skillsDetail) {
    return;
  }
  const skills: LLMNodeDataSkill[] = [
    (fcParam.pluginFCParam?.pluginList || []).map(item => {
      const pluginDetail = skillsDetail?.plugin_detail_map?.[item.plugin_id];
      const apiDetail = skillsDetail?.plugin_api_detail_map?.[item.api_id];
      const skill: LLMNodeDataPluginSkill = {
        type: LLMNodeDataSkillType.Plugin,
        pluginId: item.plugin_id,
        apiId: item.api_id,
        apiName: apiDetail?.name,
        pluginName: pluginDetail?.name,
        icon: pluginDetail?.icon_url,
      };
      return skill;
    }),
    (fcParam.workflowFCParam?.workflowList || []).map(item => {
      const detail = skillsDetail?.workflow_detail_map?.[item.workflow_id];
      const skill: LLMNodeDataWorkflowSkill = {
        type: LLMNodeDataSkillType.Workflow,
        pluginId: item.plugin_id,
        workflowId: item.workflow_id,
        name: detail?.name,
        icon: detail?.icon_url,
      };
      return skill;
    }),
    (fcParam.knowledgeFCParam?.knowledgeList || []).map(item => {
      const detail = skillsDetail?.dataset_detail_map?.[item.id];
      const skill: LLMNodeDataDatasetSkill = {
        id: item.id,
        type: LLMNodeDataSkillType.Dataset,
        name: detail?.name,
        icon: detail?.icon_url,
      };
      return skill;
    }),
  ].flat();

  const nodeData = node.getData(WorkflowNodeData);
  nodeData.updateNodeData<StandardNodeType.LLM>({
    skills,
  });
}
