import { forwardRef, type JSX, type FC } from 'react';

import {
  IconCozArrowDown,
  IconCozCross,
  IconCozLoading,
} from '@coze-arch/arco-icon';

import { cn, mergeProps } from '@/utils';

import { chipVariants } from './chip-variant';
import { type ChipProps } from './chip-types';

import './index.css';

const defaultProps: Partial<ChipProps> = {
  size: 'small',
  color: 'brand',
  loading: false,
  disabled: false,
  chipStyle: 'readonly',
};

export const Chip: FC<ChipProps> = forwardRef<HTMLDivElement, ChipProps>(
  (props, ref): JSX.Element => {
    const {
      className,
      size,
      color,
      children,
      loading,
      disabled,
      chipStyle,

      onClickRemove,

      ...restProps
    } = mergeProps(props, defaultProps);

    const cls = cn(
      chipVariants({ size, color, disabled, loading, chipStyle }),
      className,
    );

    const crossIconCls = cn(
      !disabled && 'cursor-pointer ',
      color === 'primary' &&
        !disabled &&
        !loading &&
        'coz-fg-secondary hover:coz-fg-primary',
    );

    const handleRemoveClick = (e: React.MouseEvent<SVGElement>) => {
      if (disabled || loading) {
        return;
      }
      onClickRemove?.(e);
    };

    return (
      <div ref={ref} className={cls} {...restProps}>
        {loading ? <IconCozLoading className="mr-2px animate-spin" /> : null}
        {children}
        <span className="ml-4px flex items-center">
          {chipStyle === 'remove' && (
            <IconCozCross
              className={crossIconCls}
              onClick={handleRemoveClick}
            />
          )}
          {chipStyle === 'select' && <IconCozArrowDown />}
        </span>
      </div>
    );
  },
);

Chip.displayName = 'Chip';
