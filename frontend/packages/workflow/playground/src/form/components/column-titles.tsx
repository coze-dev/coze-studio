import React, { type FC } from 'react';

export interface Column {
  label: string;
  style?: React.CSSProperties;
  required?: boolean;
}

interface ColumnTitlesProps {
  columns: Column[];
}

export const ColumnTitles: FC<ColumnTitlesProps> = ({ columns }) => (
  <div className="flex gap-1 items-center text-xs font-normal leading-4 text-[rgba(28,29,35,0.35)] tracking-[0.12px] mb-[8px]">
    {columns.map(({ label, style, required = false }, index) => (
      <div key={index} style={style}>
        {label}
        {required ? (
          <span style={{ color: '#f93920', paddingLeft: 2 }}>*</span>
        ) : null}
      </div>
    ))}
  </div>
);
