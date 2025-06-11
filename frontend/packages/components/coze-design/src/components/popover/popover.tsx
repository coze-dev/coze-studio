import { forwardRef, type JSX } from 'react';

import { Popover as SemiPopover } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';

import { type PopoverProps } from './popover-types';

import './index.css';

const defaultProps: Partial<PopoverProps> = {
  style: {},
};

export const Popover = forwardRef<SemiPopover, PopoverProps>(
  (props, ref): JSX.Element => {
    const { style, className, ...restProps } = mergeProps(props, defaultProps);
    const cls = cn('coz-popover', className);
    const mergeStyle = {
      backgroundColor: 'var(--coz-bg-max)',
      borderColor: 'var(--coz-bg-max)',
      ...style,
    };
    return (
      <SemiPopover
        className={cls}
        ref={ref}
        style={mergeStyle}
        {...restProps}
      />
    );
  },
);

Popover.displayName = 'Popover';
