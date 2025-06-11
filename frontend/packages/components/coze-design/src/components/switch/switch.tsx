import React, { useState, forwardRef } from 'react';

import { type SwitchProps as SemiSwitchProps } from '@douyinfe/semi-ui/lib/es/switch';
import { Switch as SemiSwitch } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { switchVariants, type SwitchVariantProps } from './switch-variant';
import { type SwitchProps } from './switch-types';

import './index.css';

const defaultProps: Partial<SwitchVariantProps> = {
  size: 'default',
  checked: undefined,
  loading: false,
  disabled: false,
};

// @ts-expect-error -- linter-disable-autofix
const sizeMap: Record<SwitchProps['size'], SemiSwitchProps['size']> = {
  default: 'large',
  small: 'default',
  mini: 'small',
};

const Switch = forwardRef<SemiSwitch, SwitchProps>(
  (
    {
      size = defaultProps.size,
      checked = defaultProps.checked,
      loading = defaultProps.loading,
      disabled = defaultProps.disabled,
      defaultChecked = false,
      dataTheme,
      className,
      style,
      onChange,
      ...rest
    },
    ref,
  ): JSX.Element => {
    const isControlled = typeof checked === 'boolean';

    // 不受控时，即 checked 为 undefined 时，内部记录选中状态。tailwind 消费
    const [_checked, setChecked] = useState(defaultChecked);
    const classes = cn(
      switchVariants({
        size,
        checked: isControlled ? checked : _checked,
        loading,
        disabled,
      }),
      className,
    );

    const elementProps = {
      className: classes,
      'data-theme': dataTheme,
      style,
      ref,
    };

    return (
      <SemiSwitch
        {...(elementProps as SemiSwitchProps)}
        {...(rest as SemiSwitchProps)}
        // @ts-expect-error -- linter-disable-autofix
        size={sizeMap[size]}
        // @ts-expect-error -- linter-disable-autofix
        checked={checked}
        defaultChecked={defaultChecked}
        // @ts-expect-error -- linter-disable-autofix
        loading={loading}
        // @ts-expect-error -- linter-disable-autofix
        disabled={disabled}
        onChange={(c, e) => {
          if (!isControlled) {
            setChecked(c);
          }
          onChange?.(c, e);
        }}
      />
    );
  },
);

Switch.displayName = 'Switch';

export { Switch };
