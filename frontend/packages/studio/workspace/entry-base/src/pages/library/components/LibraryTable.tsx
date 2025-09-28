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

import React from 'react';

import { Table, type ColumnProps } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import {
  type ResType,
  type ResourceInfo,
} from '@coze-arch/bot-api/plugin_develop';

import { WorkspaceEmpty } from '@/components/workspace-empty';

import { type BaseLibraryPageProps, type ListData } from '../types';
import { eventLibraryType } from '../consts';

interface LibraryTableProps {
  spaceId: string;
  isPersonalSpace: boolean;
  entityConfigs: BaseLibraryPageProps['entityConfigs'];
  listResp: {
    loading: boolean;
    data?: ListData;
    loadMore: () => void;
  };
  columns: ColumnProps<ResourceInfo>[];
  hasFilter: boolean;
  resetParams: () => void;
}

export const LibraryTable: React.FC<LibraryTableProps> = ({
  spaceId,
  isPersonalSpace,
  entityConfigs,
  listResp,
  columns,
  hasFilter,
  resetParams,
}) => (
  <Table
    data-testid="workspace.library.table"
    offsetY={178}
    tableProps={{
      loading: listResp.loading,
      dataSource: listResp.data?.list,
      columns,
      // Click on the whole line
      onRow: (record?: ResourceInfo) => {
        if (!record || record.res_type === undefined || record.detail_disable) {
          return {};
        }
        return {
          onClick: () => {
            sendTeaEvent(EVENT_NAMES.workspace_action_front, {
              space_id: spaceId,
              space_type: isPersonalSpace ? 'personal' : 'teamspace',
              tab_name: 'library',
              action: 'click',
              id: record.res_id,
              name: record.name,
              type: record.res_type && eventLibraryType[record.res_type],
            });
            entityConfigs
              .find(c => c.target.includes(record.res_type as ResType))
              ?.onItemClick(record);
          },
        };
      },
    }}
    empty={<WorkspaceEmpty onClear={resetParams} hasFilter={hasFilter} />}
    enableLoad
    loadMode="cursor"
    strictDataSourceProp
    hasMore={listResp.data?.hasMore}
    onLoad={listResp.loadMore}
  />
);
