import { forwardRef, type JSX } from 'react';

import { Collapse as SemiCollapse } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';

import { type CollapseProps } from './collapse-types';

export const CollapseComponent = forwardRef<SemiCollapse, CollapseProps>(
  (props, ref): JSX.Element => {
    const { className, ...restProps } = mergeProps(props, {});
    const cls = cn('coz-collapse', className);
    return <SemiCollapse className={cls} ref={ref} {...restProps} />;
  },
);

export const Collapse = Object.assign(CollapseComponent, {
  Panel: SemiCollapse.Panel,
});

Collapse.displayName = 'Collapse';
