import React from 'react';

import { Empty as SemiEmpty } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';

import { Button, type ButtonSize } from '../button';
import { emptyStateVariants } from './empty-state-variant';
import { type EmptyStateSize, type EmptyStateProps } from './empty-state-types';

import './index.css';

const defaultProps: Partial<EmptyStateProps> = {
  size: 'default',
};

const buttonSizeMap: Record<EmptyStateSize, ButtonSize> = {
  full_screen: 'default',
  large: 'default',
  default: 'small',
};

export const EmptyState: React.FC<EmptyStateProps> = props => {
  const {
    dataTheme,
    className,
    size,
    icon,
    darkModeIcon,
    buttonText,
    onButtonClick,
    buttonProps,
    extra,
    ...restProps
  } = mergeProps(props, defaultProps);

  const classes = cn(emptyStateVariants({ size }), className);

  const elementProps = {
    className: classes,
    'data-theme': dataTheme,
  };

  return (
    <SemiEmpty
      {...restProps}
      {...elementProps}
      image={icon}
      darkModeImage={darkModeIcon}
    >
      {buttonText ? (
        <Button
          onClick={onButtonClick}
          color="brand"
          // @ts-expect-error -- linter-disable-autofix
          size={buttonSizeMap[size]}
          {...buttonProps}
        >
          {buttonText}
        </Button>
      ) : null}
      {extra}
    </SemiEmpty>
  );
};

EmptyState.displayName = 'EmptyState';
