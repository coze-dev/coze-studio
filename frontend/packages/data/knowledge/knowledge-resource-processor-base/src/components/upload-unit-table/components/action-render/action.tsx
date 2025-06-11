import { type FC } from 'react';

import { UITableAction } from '@coze-arch/bot-semi';

import { type ActionProps } from '../../types';

export const Action: FC<ActionProps> = ({
  onDelete,
  showEdit,
  deleteProps,
  editProps,
}: ActionProps) => (
  <UITableAction
    deleteProps={{
      disabled: false,
      handleClick: onDelete,
      ...deleteProps,
    }}
    editProps={{
      hide: !showEdit,
      ...editProps,
    }}
  />
);
