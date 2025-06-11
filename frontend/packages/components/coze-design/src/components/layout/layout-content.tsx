import React, {
  type ForwardedRef,
  type PropsWithChildren,
  forwardRef,
} from 'react';

import { cn } from '@/utils';

import { type LayoutContentProps } from './layout-types';

import './index.css';
export const LayoutContent = forwardRef(
  (
    {
      className,
      children,
      scrollY = false,
    }: PropsWithChildren<LayoutContentProps>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const cls = cn(
      'coz-layout-content',
      scrollY && 'coz-layout-content-scroll',
      className,
    );
    return (
      <div ref={ref} className={cls}>
        {children}
      </div>
    );
  },
);
