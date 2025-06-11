import React, { type PropsWithChildren } from 'react';

import { cn } from '@/utils';

import { type LayoutHeaderProps } from './layout-types';

import './index.css';
export const LayoutHeader: React.FC<PropsWithChildren<LayoutHeaderProps>> = ({
  className,
  children,
  title = '',
  breadcrumb,
}) => (
  <div className={cn('coz-layout-header', className)} data-testid="ui.header">
    {title && <div className="coz-layout-header-title">{title}</div>}
    {!!breadcrumb && breadcrumb}
    {children}
  </div>
);

LayoutHeader.displayName = 'LayoutHeader';
