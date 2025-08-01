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

import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { type ToolParams } from '@coze-arch/bot-api/playground_api';
import { type Dataset } from '@coze-arch/bot-api/knowledge';
import type { PluginApi } from '@coze-arch/bot-api/developer_api';
import type { ShortCutCommand } from '@coze-agent-ide/tool-config';

export enum OpenModeType {
  OnlyOnceAdd = 'only_once_add',
}
// TODO: hzf two definitions?
export interface SkillsModalProps {
  tabsConfig?: {
    plugin?: {
      list: PluginApi[];
      onChange: (list: PluginApi[]) => void;
    };
    workflow?: {
      list: WorkFlowItemType[];
      onChange: (list: WorkFlowItemType[]) => void;
    };
    datasets?: {
      list: Dataset[];
      onChange: (list: Dataset[]) => void;
    };
    imageFlow?: {
      list: WorkFlowItemType[];
      onChange: (list: WorkFlowItemType[]) => void;
    };
  };
  tabs: ('plugin' | 'workflow' | 'datasets' | 'imageFlow')[];
  /** Open pop-up mode:
   * Do not pass by default
   * only_once_add: close after adding only once and return the callback function
   */
  openMode?: OpenModeType;
  openModeCallback?: (val?: PluginApi | WorkFlowItemType) => void;
  onCancel?: () => void;
}

export interface ToolInfo {
  tool_type: ShortCutCommand['tool_type'] | '';
  tool_params_list: ToolParams[];
  tool_name: string;
  plugin_api_name?: string;
  api_id?: string;
  plugin_id?: string;
  work_flow_id?: string;
}

export type ShortcutEditFormValues = Partial<ShortCutCommand> & {
  use_tool: boolean;
};
