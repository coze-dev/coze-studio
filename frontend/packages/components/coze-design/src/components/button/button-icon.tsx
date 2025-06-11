import { forwardRef } from 'react';

import { type Button as SemiButton } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { type IconButtonProps } from './button-types';
import { Button } from './button';

import './index.css';

export const IconButton = forwardRef<SemiButton, IconButtonProps>(
  (props, ref) => {
    const {
      className,
      wrapperClass,
      size = 'default',
      color = 'primary',
      ...restProps
    } = props;
    return (
      <div
        className={cn(
          'coz-icon-button',
          `coz-icon-button-${size}`,
          `coz-icon-button-${color}`,
          wrapperClass,
        )}
      >
        <Button
          {...restProps}
          ref={ref}
          className={cn(className)}
          size={size}
          color={color}
        />
      </div>
    );
  },
);

IconButton.displayName = 'IconButton';
