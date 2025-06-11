import React from 'react';

import { Avatar, Space } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import type { TableMetaProps } from './table-types';

import './index.css';
export const TableMeta: React.FC<TableMetaProps> = ({
  className,
  avatarClassName,
  icon_url = '',
  icon,
  name = '',
  description = '',
  suffix,
  nameIcon,
}) => (
  <div className={cn('coz-table-meta', className)} data-testid="ui.table-meta">
    {icon_url ? (
      <Avatar
        src={icon_url}
        shape="square"
        className={cn('coz-meta-avatar', avatarClassName)}
      />
    ) : null}
    {!!icon && icon}
    <div
      className={cn(
        'coz-meta-right',
        icon_url || icon ? 'coz-meta-right-width' : null,
      )}
    >
      <div className="coz-meta-name" data-testid="ui.table-meta.name">
        <Space spacing={4}>
          {name}
          {nameIcon}
        </Space>
      </div>
      {!!description && (
        <div
          className="coz-meta-description"
          data-testid="ui.table-meta.description"
        >
          {description}
        </div>
      )}
      {!!suffix && <div className="coz-meta-suffix">{suffix}</div>}
    </div>
  </div>
);

TableMeta.displayName = 'TableMeta';

export default TableMeta;
