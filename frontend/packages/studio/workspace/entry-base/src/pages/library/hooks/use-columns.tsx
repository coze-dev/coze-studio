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

import { type MouseEvent } from 'react';

import { useSize } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import {
  type ColumnProps,
  Space,
  Avatar,
  Typography,
} from '@coze-arch/coze-design';
import { responsiveTableColumn, formatDate } from '@coze-arch/bot-utils';
import {
  type ResourceInfo,
  type ResType,
} from '@coze-arch/bot-api/plugin_develop';

import { type LibraryEntityConfig } from '../types';
import { BaseLibraryItem } from '../components/base-library-item';

const { Text } = Typography;

// Default table cell minimum width
const NAME_COL_WIDTH = 260;
const ACTIONS_COL_WIDTH = 60;
const TYPE_COL_WIDTH = 100;
const CREATOR_COL_WIDTH = 231;
const EDITED_TIME_COL_WIDTH = 150;

const stopPro = (e: MouseEvent<HTMLDivElement>) => {
  e.stopPropagation(); //Stop bubbling
};

const getResTypeLabelFromConfigMap = (
  item: ResourceInfo,
  entityConfigs: LibraryEntityConfig[],
): string => {
  if (item.res_type === undefined) {
    return '-';
  }
  const target = entityConfigs.find(config =>
    config.target.includes(item.res_type as ResType),
  )?.typeFilter;
  return target?.filterName ?? target?.label ?? '-';
};

export const useGetColumns = ({
  entityConfigs,
  reloadList,
  isPersonalSpace,
}: {
  entityConfigs: LibraryEntityConfig[];
  reloadList: () => void;
  isPersonalSpace: boolean;
}): ColumnProps<ResourceInfo>[] => {
  const size = useSize(document.body);
  const clientWidth = size?.width ?? document.body.clientWidth;

  return [
    {
      title: I18n.t('library_name', {}, 'Resource'),
      dataIndex: 'name',
      width: responsiveTableColumn(clientWidth, NAME_COL_WIDTH),
      render: (_text, record) => {
        const config =
          record.res_type !== undefined
            ? entityConfigs.find(c =>
                c.target.includes(record.res_type as ResType),
              )
            : undefined;
        if (config?.renderItem) {
          return config.renderItem(record);
        }
        return <BaseLibraryItem resourceInfo={record} />;
      },
    },
    {
      title: I18n.t('library_type', {}, 'Type'),
      dataIndex: 'res_type',
      width: responsiveTableColumn(TYPE_COL_WIDTH, TYPE_COL_WIDTH),
      render: (_v, record) => (
        <div
          data-testid="workspace.library.item.type"
          className="text-[14px] font-[400]"
        >
          {getResTypeLabelFromConfigMap(record, entityConfigs)}
        </div>
      ),
    },
    ...(isPersonalSpace
      ? []
      : ([
          {
            title: I18n.t('Plugin_list_table_owner'),
            dataIndex: 'creator',
            width: responsiveTableColumn(CREATOR_COL_WIDTH, CREATOR_COL_WIDTH),
            render: (_v, record) => {
              if (!record.creator_name) {
                return '-';
              }
              return (
                <Space style={{ width: '100%' }} spacing={6}>
                  <Avatar
                    data-testid="workspace.library.item.creator.avatar"
                    size="extra-small"
                    src={record.creator_avatar}
                  />
                  <Text
                    data-testid="workspace.library.item.creator.name"
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--coz-fg-secondary)',
                    }}
                    ellipsis={{ showTooltip: true }}
                  >
                    {record.creator_name}
                  </Text>
                  <Text
                    data-testid="workspace.library.item.creator.username"
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 400,
                      color: 'var(--coz-fg-secondary)',
                    }}
                    ellipsis={{ showTooltip: true }}
                  >
                    {`@${record.user_name}`}
                  </Text>
                </Space>
              );
            },
          },
        ] satisfies ColumnProps<ResourceInfo>[])),
    {
      title: I18n.t('library_edited_time', {}, 'Edited time'),
      dataIndex: 'edit_time',
      width: responsiveTableColumn(
        EDITED_TIME_COL_WIDTH,
        EDITED_TIME_COL_WIDTH,
      ),
      render: (_v, record) => {
        if (!record.edit_time) {
          return '-';
        }
        return (
          <div
            data-testid="workspace.library.item.edit.time"
            className="text-[14px] font-[400]"
          >
            {formatDate(Number(record.edit_time), 'YYYY-MM-DD HH:mm')}
          </div>
        );
      },
    },
    {
      title: I18n.t('library_actions', {}, 'Actions'),
      dataIndex: 'action',
      width: responsiveTableColumn(ACTIONS_COL_WIDTH, ACTIONS_COL_WIDTH),
      render: (_v, record) => {
        const config =
          record.res_type !== undefined
            ? entityConfigs.find(c =>
                c.target.includes(record.res_type as ResType),
              )
            : undefined;

        return (
          <div
            data-testid="workspace.library.item.actions"
            onClick={e => {
              stopPro(e);
            }}
          >
            {config?.renderActions(record, reloadList) ?? null}
          </div>
        );
      },
    },
  ];
};
