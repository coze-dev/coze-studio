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

import { useEffect } from 'react';

import { uniqBy } from 'lodash-es';
import { useWorkflowNode } from '@coze-workflow/base';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import {
  isSkillsEmpty,
  getSkillsQueryParams,
} from '@/nodes-v2/llm/skills/utils';
import { useQuerySettingDetail } from '@/nodes-v2/llm/skills/use-query-setting-detail';
import { type BoundSkills } from '@/nodes-v2/llm/skills/types';
import { useGlobalState, useDependencyService } from '@/hooks';

import { updateNodeSkills } from './update-node-skills';
import { type SkillTag } from './skill-tags';

function getSkillTag(value?: { name?: string; icon_url?: string }): SkillTag {
  return {
    label: value?.name ?? '',
    icon: value?.icon_url,
  };
}

export function useSkillTags(): SkillTag[] {
  const { data } = useWorkflowNode();
  const fcParam: BoundSkills = data?.fcParam || {};
  const globalState = useGlobalState();
  const node = useCurrentEntity();
  const dependencyService = useDependencyService();

  const { data: skillsDetail, refetch } = useQuerySettingDetail({
    workflowId: globalState.workflowId,
    spaceId: globalState.spaceId,
    nodeId: node.id,
    enabled: !isSkillsEmpty(fcParam),
    ...getSkillsQueryParams(fcParam),
  });

  useEffect(() => {
    const disposable = dependencyService.onDependencyChange(props => {
      if (!props?.extra?.nodeIds?.includes(node.id)) {
        return;
      }
      refetch();
    });

    return () => {
      disposable?.dispose?.();
    };
  }, []);

  const skills: SkillTag[] = [
    uniqBy(
      fcParam.pluginFCParam?.pluginList || [],
      plugin => plugin.plugin_id,
    ).map(item =>
      getSkillTag(skillsDetail?.plugin_detail_map?.[item.plugin_id]),
    ),
    (fcParam.workflowFCParam?.workflowList || [])?.map(item =>
      getSkillTag(skillsDetail?.workflow_detail_map?.[item.workflow_id]),
    ),
    (fcParam.knowledgeFCParam?.knowledgeList || [])?.map(item =>
      getSkillTag(skillsDetail?.dataset_detail_map?.[item.id]),
    ),
  ].flat();

  updateNodeSkills(node, fcParam, skillsDetail);

  return skills;
}
