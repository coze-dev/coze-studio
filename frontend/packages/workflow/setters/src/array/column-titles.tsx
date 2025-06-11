import React, { type FC } from 'react';

import styles from './column-titles.module.less';

interface Column {
  label: string;
  width?: number;
  required?: boolean;
  style?: React.CSSProperties;
}

interface ColumnTitlesProps {
  columns: Column[];
}

export const ColumnTitles: FC<ColumnTitlesProps> = ({ columns }) => (
  <div className={styles['column-titles']}>
    {columns.map(({ label, width, required = false, style }, index) => (
      <div
        key={index}
        className={styles['column-title']}
        style={{ width: width ? `${width}px` : 'auto', ...(style || {}) }}
      >
        {label}
        {required ? (
          <span style={{ color: '#f93920', paddingLeft: 2 }}>*</span>
        ) : null}
      </div>
    ))}
  </div>
);
