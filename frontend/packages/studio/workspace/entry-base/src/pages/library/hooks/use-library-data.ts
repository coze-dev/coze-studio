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

import { useInfiniteScroll } from 'ahooks';
import {
  type LibraryResourceListRequest,
  type ResourceInfo,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import { type ListData, type BaseLibraryPageProps } from '../types';
import { LIBRARY_PAGE_SIZE } from '../consts';

// 数据转换函数
const transformResourceList = (resourceList: ResourceInfo[]): ResourceInfo[] =>
  resourceList.map(item => {
    if (!item) {
      return item;
    }

    const transformedItem: ResourceInfo = {
      ...item,
      res_id: String(
        (item as Record<string, unknown>).ResID ||
          (item as Record<string, unknown>).res_id ||
          '',
      ),
      creator_id: String(
        (item as Record<string, unknown>).CreatorID ||
          (item as Record<string, unknown>).creator_id ||
          '',
      ),
      edit_time:
        ((item as Record<string, unknown>).EditTime as number) ||
        ((item as Record<string, unknown>).edit_time as number),
      space_id: String(
        (item as Record<string, unknown>).SpaceID ||
          (item as Record<string, unknown>).space_id ||
          '',
      ),
    };
    return transformedItem;
  });

interface LibraryDataParams {
  res_type_filter?: number[];
  user_filter?: number;
  publish_status_filter?: number;
  name?: string;
}

export const useLibraryData = (
  spaceId: string,
  entityConfigs: BaseLibraryPageProps['entityConfigs'],
  params: LibraryDataParams,
) =>
  useInfiniteScroll<ListData>(
    async prev => {
      const resp = await PluginDevelopApi.LibraryResourceList(
        entityConfigs.reduce<LibraryResourceListRequest>(
          (res, config) => config.parseParams?.(res) ?? res,
          {
            ...params,
            cursor: prev?.nextCursorId,
            space_id: spaceId,
            size: LIBRARY_PAGE_SIZE,
          },
        ),
      );

      const resourceList = resp?.resource_list || [];
      const transformedList = transformResourceList(resourceList);

      return {
        list: transformedList,
        nextCursorId: resp?.cursor,
        hasMore: !!resp?.has_more,
      };
    },
    {
      target: () =>
        document.querySelector('[data-testid="workspace.library.table"]'),
      isNoMore: d => !d?.hasMore,
      reloadDeps: [
        spaceId,
        params.res_type_filter,
        params.publish_status_filter,
        params.user_filter,
        params.name,
      ],
    },
  );
