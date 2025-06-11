import { type ColumnProps } from '@coze/coze-design';
import { type PersonalAccessToken } from '@coze-arch/bot-api/pat_permission_api';

import { columnStatusConf } from './column-status';
import { ColumnOpBody, columnOpConf } from './column-op';
import { columnNameConf } from './column-name';
import { columnLastUseAtConf } from './column-last-use-at';
import { columnExpireAtConf } from './column-expire-at';
import { columnCreateAtConf } from './column-create-at';
export const getTableColumnConf = ({
  onEdit,
  onDelete,
}: {
  onEdit: (v: PersonalAccessToken) => void;
  onDelete: (id: string) => void;
}): ColumnProps<PersonalAccessToken>[] => [
  columnNameConf(),
  columnCreateAtConf(),
  columnLastUseAtConf(),
  columnExpireAtConf(),
  columnStatusConf(),
  {
    ...columnOpConf(),
    render: (_, record) => (
      <ColumnOpBody {...{ record, isCurrentUser: true, onEdit, onDelete }} />
    ),
  },
];

export const patColumn = {
  columnNameConf,
  columnCreateAtConf,
  columnLastUseAtConf,
  columnExpireAtConf,
  columnStatusConf,
  ColumnOpBody,
  columnOpConf,
};
