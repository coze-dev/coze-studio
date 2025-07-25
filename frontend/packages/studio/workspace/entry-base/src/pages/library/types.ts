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
 
import { type ReactNode } from 'react';

import { type CascaderData } from '@coze-arch/coze-design';
import {
  type LibraryResourceListRequest,
  type ResType,
  type ResourceInfo,
} from '@coze-arch/bot-api/plugin_develop';

export interface LibraryEntityConfig {
  /**
   * 资源类型筛选器配置，传入级联选择器的数据类型
   **/
  typeFilter?: CascaderData & ({ filterName: string } | { label: string });

  /**
   * 允许各个业务定制请求参数的格式化逻辑，避免特化逻辑侵入到底层组件中
   * @param params 原始的 query 参数
   * @returns 格式化后的 query 参数
   */
  parseParams?: (
    params: LibraryResourceListRequest,
  ) => LibraryResourceListRequest;

  /**
   * 渲染创建菜单
   * @param params 相关参数
   * @params params.spaceId 空间 ID
   * @params params.isPersonalSpace 是否是个人空间
   * @params params.reloadList 刷新列表 API
   * @returns 渲染结果
   */
  renderCreateMenu?: () => ReactNode;

  // #region 表格配置
  /**
   * 匹配数据项是否由当前配置控制渲染
   */
  target: ResType[];
  /**
   * 表格行点击事件回调，一般用于打开详情弹窗或者跳转详情页
   * @param item 点击行数据;
   * @returns void;
   */
  onItemClick: (item: ResourceInfo) => void;
  /**
   * 渲染表格资源信息列内容,不传则默认使用通用组件进行渲染
   * @param item 行数据
   * @returns 渲染结果
   */
  renderItem?: (item: ResourceInfo) => ReactNode;
  /**
   * 渲染资源类型文案，缺省会使用 typeFilter 中的 label
   * @param resType
   * @returns
   */
  renderResType?: (item: ResourceInfo) => string | undefined;
  /**
   * 渲染表格操作列内容
   * @param item 行数据
   * @param reloadList 刷新列表 API
   * @returns 渲染结果
   */
  renderActions: (item: ResourceInfo, reloadList: () => void) => ReactNode;

  // #endregion 表格配置
}

export interface ListData {
  list: ResourceInfo[];
  hasMore: boolean;
  nextCursorId: string | undefined;
}

export interface BaseLibraryPageProps {
  spaceId: string;
  isPersonalSpace?: boolean;
  entityConfigs: LibraryEntityConfig[];
}
