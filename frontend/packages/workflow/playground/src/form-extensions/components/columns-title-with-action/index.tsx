import { type CSSProperties } from 'react';

import classnames from 'classnames';

import { ColumnsTitle, type ColumnsTitleProps } from '../columns-title';

export interface ColumnsTitleWithActionProps extends ColumnsTitleProps {
  actionWidth?: number;
  readonly?: boolean;
  className?: string;
  style?: CSSProperties;
}

const getActionColumns = (
  columns: ColumnsTitleProps['columns'],
  readonly?: boolean,
  actionWidth = 24,
) => [
  ...columns,
  ...(readonly
    ? []
    : [
        {
          title: '',
          style: {
            width: actionWidth,
          },
        },
      ]),
];

export const ColumnsTitleWithAction = ({
  actionWidth,
  className,
  columns,
  readonly,
  style,
}: ColumnsTitleWithActionProps) => (
  <ColumnsTitle
    className={classnames('gap-1', className)}
    columns={getActionColumns(columns, readonly, actionWidth)}
    style={style}
  />
);
