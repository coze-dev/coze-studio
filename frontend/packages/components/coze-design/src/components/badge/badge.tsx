import { forwardRef, type JSX, type FC } from 'react';

import { Badge as SemiBadge } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';

import { badgeVariants } from './badge-variant';
import { type BadgeProps } from './badge-types';

import './index.css';

const defaultProps: Partial<BadgeProps> = {};

export const Badge: FC<BadgeProps> = forwardRef<SemiBadge, BadgeProps>(
  (props, ref): JSX.Element => {
    const {
      children,
      position,
      dot,
      type,
      cozLayout,
      className,
      ...restProps
    } = mergeProps(props, defaultProps);

    const cls = cn(badgeVariants({ type, cozLayout }), className);

    return (
      <SemiBadge
        ref={ref}
        dot={type === 'mini'}
        position={position}
        className={cls}
        {...restProps}
      >
        {children}
      </SemiBadge>
    );
  },
);

Badge.displayName = 'Badge';
