import { useRef } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type ColumnProps } from '@coze/coze-design';
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
