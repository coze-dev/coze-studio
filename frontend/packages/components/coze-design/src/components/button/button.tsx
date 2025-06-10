import { forwardRef, useMemo, type JSX } from 'react';

import { Button as SemiButton } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { IconCozLoading } from '@/components/icon';

import { buttonVariants } from './button-variant';
import { type ButtonProps } from './button-types';

import './index.css';
import { Badge } from '@/components/badge';

export const Button = forwardRef<SemiButton, ButtonProps>(
  (props, ref): JSX.Element => {
    const {
      children,
      className,
      color = 'brand',
      size = 'default',
      disabled = false,
      loading = false,
      useSpinIcon = true,
      theme = 'solid',
      showBadge = false,
      badgeColor = 'default',
      ...restProps
    } = props;
    const cls = useMemo(
      () =>
        cn(
          buttonVariants({
            color,
            size,
            disabled,
          }),
          className,
        ),
      [color, size, disabled, className, loading],
    );

    let c = children;
    if (showBadge) {
      c = (
        <>
          {children}
          <Badge
            type="mini"
            cozLayout
            className={`coz-btn-badge coz-btn-badge-${badgeColor === 'default' ? color : 'unset'}`}
          ></Badge>
        </>
      );
    }

    return (
      <SemiButton
        {...restProps}
        disabled={disabled || loading}
        className={cls}
        theme={theme}
        icon={
          loading && useSpinIcon ? (
            <IconCozLoading className="coz-btn-loading" />
          ) : (
            props.icon
          )
        }
        ref={ref}
      >
        {c}
      </SemiButton>
    );
  },
);

Button.displayName = 'Button';
