import { type FC } from 'react';

import cls from 'classnames';
import { type TableProps, Table } from '@coze/coze-design';

import styles from './index.module.less';

export const AuthTable: FC<
  TableProps & {
    size?: 'small' | 'default';
    type?: 'primary' | 'default';
  }
> = ({
  wrapperClassName,
  tableProps,
  size = 'default',
  type = 'default',
  ...rest
}) => (
  <Table
    {...rest}
    wrapperClassName={cls(styles['table-wrap'], wrapperClassName)}
    tableProps={{
      ...tableProps,
      className: cls(
        styles['table-content'],
        tableProps?.className,
        styles[size],
        styles[type],
      ),
    }}
  />
);
