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
import {
  type OrderBy,
  type PluginApi,
} from '@coze-arch/bot-api/developer_api';

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
  // 后端规定传 undefined 才不拼 query，
  isOfficial: undefined | true;
  // multiAgent模式下传递
  agentId?: string;
  // 根据bot推荐插件
  botInfo?: {
    current_entity_type?: product_common.ProductEntityType;
    current_entity_id?: Int64;
    current_entity_version?: Int64;
  };
  pluginType?: PluginType;
}

/** plugin 弹窗打开来源 */
export enum From {
  /** 在 workflow 打开 */
  WorkflowAddNode = 'workflow_addNode',

  /** 在 bot skills 打开 */
  BotSkills = 'bot_skills',

  /** 在 bot triggers 打开  */
  BotTrigger = 'bot_trigger',

  /** 在 project ide 打开 */
  ProjectIde = 'project_ide',

  /** 在 project workflow 打开 */
  ProjectWorkflow = 'project_workflow',
}

export { OpenModeType };
export interface PluginModalModeProps {
  /** 打开弹窗模式：
   * 默认不传
   * only_once_add：仅可添加一次后关闭，并返回callback函数
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
  // project ide 场景下传递需要传已选的插件，反显用
  pluginApiList?: PluginApi[];
  // project ide 场景下传递projectId
  projectId?: string;
  // 关闭弹窗回调
  closeCallback?: () => void;
  // project 场景下点击插件回调
  clickProjectPluginCallback?: (
    val?: PluginInfoForPlayground & {
      listed_at?: Int64;
    },
  ) => void;
  // 创建成功回调
  onCreateSuccess?: (val?: { spaceId?: string; pluginId?: string }) => void;
  // 是否展示商店插件
  isShowStorePlugin?: boolean;
  // 隐藏创建按钮
  hideCreateBtn?: boolean;
  initQuery?: Partial<PluginQuery>;
}
