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

// Format selected plugin parameter list
import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { type PluginApi, ToolType } from '@coze-arch/bot-api/playground_api';

import { type ToolInfo } from '../../../types';

// Check up to 10 parameters. If the number of input parameters exceeds 10, only 10 of them will be checked, and the required parameters will be selected first; when 10 parameters are checked, other checkboxes out grey cannot be checked.
export const MAX_TOOL_PARAMS_COUNT = 10;

// Initialization tool list parameters
export const initToolInfoByToolApi = (
  toolApi?: WorkFlowItemType | PluginApi,
): ToolInfo | null => {
  if (!toolApi) {
    return null;
  }
  const isWorkflow = 'workflow_id' in toolApi;

  const workflowPluginProcessedToolInfo = isWorkflow
    ? initToolInfoByWorkFlow(toolApi as WorkFlowItemType)
    : initToolInfoByPlugin(toolApi);

  const { tool_params_list } = workflowPluginProcessedToolInfo;

  // Sort params to rank fields with required = true first
  const sortedParams = tool_params_list?.sort(
    (a, b) => (b.required ? 1 : -1) - (a.required ? 1 : -1),
  );

  return {
    ...workflowPluginProcessedToolInfo,
    tool_params_list:
      sortedParams?.map((param, index) => {
        const { name, desc, required, type } = param;
        return {
          name,
          type,
          desc,
          required,
          default_value: '',
          refer_component: index < MAX_TOOL_PARAMS_COUNT,
        };
      }) || [],
  };
};

// Convert workflow parameters to toolParams
export const initToolInfoByWorkFlow = (
  workFlow: WorkFlowItemType,
): ToolInfo => {
  const { name, parameters, workflow_id, ...rest } = workFlow;
  return {
    ...rest,
    tool_type: ToolType.ToolTypeWorkFlow,
    tool_name: name,
    plugin_api_name: name,
    tool_params_list: parameters || [],
    work_flow_id: workflow_id,
  };
};

export const initToolInfoByPlugin = (plugin: PluginApi): ToolInfo => {
  const { name, plugin_name, parameters, ...rest } = plugin;
  return {
    ...rest,
    tool_type: ToolType.ToolTypePlugin,
    tool_name: plugin_name ?? '',
    plugin_api_name: name,
    tool_params_list: parameters || [],
  };
};

// Get tabs opened by skillModal
export const getSkillModalTab = (): (
  | 'plugin'
  | 'workflow'
  | 'imageFlow'
  | 'datasets'
)[] => ['plugin', 'workflow'];
