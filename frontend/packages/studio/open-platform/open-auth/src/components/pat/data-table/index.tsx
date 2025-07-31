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

import { useRef } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type ColumnProps } from '@coze-arch/coze-design';
import { UIEmpty } from '@coze-arch/bot-semi';
import { type PersonalAccessToken } from '@coze-arch/bot-api/pat_permission_api';

import { useTableHeight } from '@/hooks/use-table-height';
import { AuthTable } from '@/components/auth-table';

import { getTableColumnConf } from './table-column';

import styles from './index.module.less';
export type GetCustomDataConfig = (options: {
  onEdit: (v: PersonalAccessToken) => void;
  onDelete: (id: string) => void;
}) => ColumnProps<PersonalAccessToken>[];

interface DataTableProps {
  loading: boolean;
  size?: 'small' | 'default';
  type?: 'primary' | 'default';
  dataSource: PersonalAccessToken[];
  onEdit: (v: PersonalAccessToken) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  renderDataEmptySlot?: () => React.ReactElement | null;
  getCustomDataConfig?: GetCustomDataConfig;
}

export const DataTable = ({
  loading,
  dataSource,
  onEdit,
  onDelete,
  onAddClick,
  renderDataEmptySlot,
  getCustomDataConfig = getTableColumnConf,
  size,
  type,
}: DataTableProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const tableHeight = useTableHeight(tableRef);

  const columns: ColumnProps<PersonalAccessToken>[] = getCustomDataConfig?.({
    onEdit,
    onDelete,
  }).filter(item => !item.hidden);

  return (
    <div className={cls('flex-1', styles['table-container'])} ref={tableRef}>
      <AuthTable
        useHoverStyle={false}
        size={size}
        type={type}
        tableProps={{
          rowKey: 'id',
          loading,
          dataSource,
          columns,
          scroll: { y: tableHeight },
        }}
        empty={
          renderDataEmptySlot?.() || (
            <UIEmpty
              empty={{
                title: I18n.t('no_api_token_1'),
                description: I18n.t('add_api_token_1'),
                btnText: I18n.t('add_new_token_button_1'),
                btnOnClick: onAddClick,
              }}
            />
          )
        }
      />
    </div>
  );
};
