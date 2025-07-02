import { type CSSProperties } from 'react';

import classnames from 'classnames';

import { type AnyValue } from '../../setters/typings';

import styles from './index.module.less';

export interface Column {
  title: string;
  style?: AnyValue;
}
export interface ColumnsTitleProps {
  columns: Column[];
  className?: string;
  style?: CSSProperties;
}

export const ColumnsTitle = ({ columns, className, style }: ColumnsTitleProps) => (
  <div className={classnames(styles.columnsTitle, className)} style={style}>
    {columns.map(({ title, style: colStyle }: Column) => (
      <div style={colStyle}>{title}</div>
    ))}
  </div>
);
