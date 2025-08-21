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
   * Resource type filter configuration, passing in the data type of the cascading selector
   **/
  typeFilter?: CascaderData & ({ filterName: string } | { label: string });

  /**
   * Allows each business to customize the formatting logic of request parameters to avoid intrusion of specialized logic into the underlying components
   * @Param params original query parameters
   * @Returns formatted query parameters
   */
  parseParams?: (
    params: LibraryResourceListRequest,
  ) => LibraryResourceListRequest;

  /**
   * Render Create Menu
   * @param params related parameters
   * @Params params.spaceId Space ID
   * @Params params.isPersonalSpace is a personal space
   * @Params params.reloadList Refresh List API
   * @Returns render result
   */
  renderCreateMenu?: () => ReactNode;

  // #region table configuration
  /**
   * Whether matching data items are rendered by the current configuration
   */
  target: ResType[];
  /**
   * Table row click event callback, usually used to open the details pop-up window or jump to the details page
   * @param item click row data;
   * @returns void;
   */
  onItemClick: (item: ResourceInfo) => void;
  /**
   * Render the content of the table resource information column. If it is not passed, it will be rendered using general components by default.
   * @param item row data
   * @Returns render result
   */
  renderItem?: (item: ResourceInfo) => ReactNode;
  /**
   * Render the resource type copy, using the label in the typeFilter by default
   * @param resType
   * @returns
   */
  renderResType?: (item: ResourceInfo) => string | undefined;
  /**
   * Render table operation column content
   * @param item row data
   * @param reloadList API
   * @Returns render result
   */
  renderActions: (item: ResourceInfo, reloadList: () => void) => ReactNode;

  // #endregion table configuration
}

export interface ListData {
  list: ResourceInfo[];
  hasMore: boolean;
  nextCursorId: string | undefined;
}

export interface BaseLibraryPageProps {
  spaceId: string;
  sourceType: string;
  isPersonalSpace?: boolean;
  entityConfigs: LibraryEntityConfig[];
}
