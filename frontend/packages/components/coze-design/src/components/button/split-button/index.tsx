import { forwardRef } from 'react';

import { type Button as SemiButton, SplitButtonGroup } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { IconCozArrowDown } from '@/components/icon';

import { type SplitButtonProps } from '../button-types';
import { IconButton } from '../button-icon';

import '../index.css';

export const SplitButton = forwardRef<SemiButton, SplitButtonProps>(
  (props, ref) => {
    const {
      className,
      wrapperClass,
      children,
      onClick,
      onIconClick,
      size = 'default',
      color = 'brand',
      loading = false,
      disabled = false,
      ...restProps
    } = props;
    return (
      <SplitButtonGroup className={cn('coz-split-button', wrapperClass)}>
        <IconButton
          {...restProps}
          className={cn(['!rounded-r-none'], className)}
          loading={loading}
          disabled={disabled}
          size={size}
          color={color}
          onClick={onClick}
        >
          {children}
        </IconButton>
        <IconButton
          ref={ref}
          onClick={onIconClick}
          loading={loading}
          className={cn(['!rounded-l-none'])}
          color={color}
          size={size}
          useSpinIcon={false}
          disabled={disabled}
          icon={<IconCozArrowDown />}
        />
      </SplitButtonGroup>
    );
  },
);

SplitButton.displayName = 'SplitButton';
