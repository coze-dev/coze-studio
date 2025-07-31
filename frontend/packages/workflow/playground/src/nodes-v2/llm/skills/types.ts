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

import { type IDataSetInfo } from '@coze-data/knowledge-modal-base';
import {
  type FCPluginSetting,
  type APIParameter,
  type FCWorkflowSetting,
} from '@coze-arch/idl/workflow_api';

export enum SkillType {
  Plugin = 'plugin',
  Workflow = 'workflow',
  Knowledge = 'knowledge',
}

export type PluginFCParamsSetting = APIParameter;

export type FCRequestParamsSetting = PluginFCParamsSetting;
export type FCResponseParamsSetting = PluginFCParamsSetting;
export interface FCResponseStyleSetting {
  mode: number;
}

export type PluginFCSetting = FCPluginSetting;
export type WorkflowFCSetting = FCWorkflowSetting;

export interface BoundWorkflowItem {
  plugin_id: string;
  workflow_id: string;
  // If it is a project, fill in the project version, and fill in the plugin version in the resource library.
  plugin_version: string;
  workflow_version: string;
  // Fill in true if it is project, false for resource library
  is_draft: boolean;
  fc_setting?: WorkflowFCSetting;
}

export interface BoundPluginItem {
  plugin_id: string;
  api_id: string;
  api_name: string;
  // If it is a project, fill in the project version, and fill in the plugin version in the resource library.
  plugin_version: string;
  // Fill in true if it is project, false for resource library
  is_draft: boolean;
  fc_setting?: PluginFCSetting;
}

export interface BoundKnowledgeItem {
  id: string;
  name: string;
}

export type KnowledgeGlobalSetting = Omit<IDataSetInfo, 'recall_strategy'> & {
  use_rerank: boolean;
  use_rewrite: boolean;
  use_nl2_sql: boolean;
};

export interface BoundSkills {
  workflowFCParam?: {
    workflowList?: Array<BoundWorkflowItem>;
  };
  pluginFCParam?: {
    pluginList?: Array<BoundPluginItem>;
  };
  knowledgeFCParam?: {
    knowledgeList?: Array<BoundKnowledgeItem>;
    global_setting?: KnowledgeGlobalSetting;
  };
}
