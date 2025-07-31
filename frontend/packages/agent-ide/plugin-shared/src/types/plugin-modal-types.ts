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

import { OpenModeType } from '@coze-arch/bot-hooks';
import {
  type PluginType,
  type Int64,
  type product_common,
  type SortType,
} from '@coze-arch/bot-api/product_api';
import { type PluginInfoForPlayground } from '@coze-arch/bot-api/plugin_develop';
import { type OrderBy, type PluginApi } from '@coze-arch/bot-api/developer_api';

import { type MineActiveEnum } from '../constants/plugin-modal-constants';

export interface CommonQuery {
  search: string;
  type: string | number;
  page: number;
  orderBy: OrderBy;
  mineActive: MineActiveEnum;
}
export interface ListItemCommon {
  belong_page?: number;
}
export interface RequestServiceResp<ListItem extends ListItemCommon> {
  list: Array<ListItem>;
  total: number;
  hasMore?: boolean;
}

export interface PluginQuery {
  projectId?: string;
  devId?: string;
  page: number;
  search: string;
  type: string | number;
  orderBy: OrderBy;
  orderByPublic: SortType | OrderBy;
  mineActive: MineActiveEnum;
  orderByFavorite: SortType;
  // The backend stipulates that passing undefined does not spell query.
  isOfficial: undefined | true;
  // Transfer in multiAgent mode
  agentId?: string;
  // Recommend plugins according to bot
  botInfo?: {
    current_entity_type?: product_common.ProductEntityType;
    current_entity_id?: Int64;
    current_entity_version?: Int64;
  };
  pluginType?: PluginType;
}

/** Plugin pop-up window open source */
export enum From {
  /** Open in workflow */
  WorkflowAddNode = 'workflow_addNode',

  /** Open in bot skills */
  BotSkills = 'bot_skills',

  /** Open in bot triggers  */
  BotTrigger = 'bot_trigger',

  /** Open in project ide */
  ProjectIde = 'project_ide',

  /** Open in project workflow */
  ProjectWorkflow = 'project_workflow',
}

export { OpenModeType };
export interface PluginModalModeProps {
  /** Open pop-up mode:
   * Do not pass by default
   * only_once_add: close after adding only once and return the callback function
   */
  openMode?: OpenModeType;
  from?: From;
  openModeCallback?: (
    val?: PluginApi & {
      plugin_icon?: string;
      project_id?: string;
      version_name?: string;
      version_ts?: string;
    },
  ) => void;
  showButton?: boolean;
  showCopyPlugin?: boolean;
  onCopyPluginCallback?: (val: { pluginID?: string; name?: string }) => void;
  // In the project ide scenario, you need to pass the selected plug-in, which is used inversely
  pluginApiList?: PluginApi[];
  // Pass projectId in the project ide scene
  projectId?: string;
  // Close pop-up callback
  closeCallback?: () => void;
  // Click on the plugin callback in the project scene
  clickProjectPluginCallback?: (
    val?: PluginInfoForPlayground & {
      listed_at?: Int64;
    },
  ) => void;
  // Create a successful callback
  onCreateSuccess?: (val?: { spaceId?: string; pluginId?: string }) => void;
  // Whether to display store plugins
  isShowStorePlugin?: boolean;
  // Hide create button
  hideCreateBtn?: boolean;
  initQuery?: Partial<PluginQuery>;
}
