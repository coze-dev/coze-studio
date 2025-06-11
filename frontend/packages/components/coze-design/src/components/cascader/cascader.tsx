import { forwardRef } from 'react';

import { type CascaderProps as SemiCascaderProps } from '@douyinfe/semi-ui/lib/es/cascader';
import { Cascader as SemiCascader } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { IconCozArrowDown } from '@/components/icon';

import './cascader.css';

import {
  cascaderVariants,
  type CascaderVariantProps,
} from './cascader-variant';
import { type CascaderProps } from './cascader-types';

const defaultProps: Partial<CascaderVariantProps> = {
  // checked: undefined,
  // loading: false,
  size: 'default',
  hasError: false,
  disabled: false,
};

// @ts-expect-error -- linter-disable-autofix
const iconSize: Record<CascaderProps['size'], string> = {
  default: 'text-lg',
  small: 'text-base',
};

const Cascader = forwardRef<SemiCascader, CascaderProps>(
  (
    {
      hasError = defaultProps.hasError,
      disabled = defaultProps.disabled,
      size = defaultProps.size,
      dataTheme,
      className,
      style,
      onChange,
      restTagsPopoverProps = {},
      dropdownClassName,
      ...rest
    },
    ref,
  ): JSX.Element => {
    const classes = cn(cascaderVariants({ hasError }), className);

    const elementProps = {
      className: `${classes} ${hasError ? 'coz-cascader-error' : ''}`,
      'data-theme': dataTheme,
      style,
      ref,
    };

    return (
      <SemiCascader
        {...(elementProps as SemiCascaderProps)}
        {...(rest as SemiCascaderProps)}
        onChange={onChange}
        // @ts-expect-error -- linter-disable-autofix
        disabled={disabled}
        // @ts-expect-error -- linter-disable-autofix
        size={size}
        // @ts-expect-error -- linter-disable-autofix
        arrowIcon={<IconCozArrowDown className={iconSize[size]} />}
        restTagsPopoverProps={{
          ...restTagsPopoverProps,
          className: `${
            restTagsPopoverProps.className || ''
          } coz-cascader-tag-popover`,
        }}
        separator=" > "
        dropdownClassName={`${dropdownClassName || ''} coz-cascader-dropdown`}
      />
    );
  },
);

Cascader.displayName = 'Cascader';

export { Cascader };
