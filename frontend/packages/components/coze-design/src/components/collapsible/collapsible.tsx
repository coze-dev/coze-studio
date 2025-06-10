import { forwardRef, type JSX } from 'react';

import { Collapsible as SemiCollapsible } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';

import { type CollapsibleProps } from './collapsible-types';

export const Collapsible = forwardRef<SemiCollapsible, CollapsibleProps>(
  (props, ref): JSX.Element => {
    const { className, ...restProps } = mergeProps(props, {});
    const cls = cn('coz-collapsible', className);
    return <SemiCollapsible className={cls} ref={ref} {...restProps} />;
  },
);

Collapsible.displayName = 'Collapsible';
