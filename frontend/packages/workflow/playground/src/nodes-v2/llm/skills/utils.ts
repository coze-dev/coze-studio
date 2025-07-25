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
 
import { type BoundSkills } from './types';

/**
 * 根据projectId判断是否是草稿
 * 资源库里面的插件 project_id = '0'
 */
export function isDraftByProjectId(projectId?: string) {
  return projectId && projectId !== '0' ? true : false;
}

/**
 * 技能是否为空
 * @param value
 * @returns
 */
export function isSkillsEmpty(value: BoundSkills) {
  return (
    !value.pluginFCParam?.pluginList?.length &&
    !value.workflowFCParam?.workflowList?.length &&
    !value.knowledgeFCParam?.knowledgeList?.length
  );
}

/**
 * 获取技能查询参数
 * @param fcParam
 * @returns
 */
export function getSkillsQueryParams(boundSkills?: BoundSkills) {
  return {
    plugin_list: boundSkills?.pluginFCParam?.pluginList?.map(item => ({
      plugin_id: item.plugin_id,
      api_id: item.api_id,
      api_name: item.api_name,
      is_draft: item.is_draft,
      plugin_version: item.plugin_version,
    })),
    workflow_list: boundSkills?.workflowFCParam?.workflowList?.map(item => ({
      workflow_id: item.workflow_id,
      plugin_id: item.plugin_id,
      is_draft: item.is_draft,
      workflow_version: item.workflow_version,
    })),
    dataset_list: boundSkills?.knowledgeFCParam?.knowledgeList?.map(item => ({
      dataset_id: item.id,
      is_draft: false,
    })),
  };
}
