import React, { type PropsWithChildren } from 'react';

import { cn } from '@/utils';

import { type LayoutFooterProps } from './layout-types';

import './index.css';
export const LayoutFooter: React.FC<PropsWithChildren<LayoutFooterProps>> = ({
  className,
  children,
}) => <div className={cn('coz-layout-foot', className)}>{children}</div>;

export default LayoutFooter;
