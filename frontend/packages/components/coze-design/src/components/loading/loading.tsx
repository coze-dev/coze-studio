import { forwardRef, type JSX } from 'react';

import { Spin as SemiLoading } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';
import { IconCozLoading } from '@/components/icon';

import { loadingVariants } from './loading-variant';
import { type LoadingProps, type SizeMapping } from './loading-types';

import './index.css';

const defaultProps: Partial<LoadingProps> = {
  label: '',
  color: 'default',
  size: 'middle',
  labelSize: 'small',
};

const sizeMapping: SizeMapping = {
  mini: 'small',
  small: 'normal',
  middle: 'middle',
  large: 'large',
};

export const Loading = forwardRef<SemiLoading, LoadingProps>(
  (props, ref): JSX.Element => {
    const {
      size = 'normal',
      className,
      loading,
      label,
      color,
      labelSize,
      indicator,
      children,
      ...restProps
    } = mergeProps(props, defaultProps);

    const wrapperCls = cn(
      loadingVariants.wrapper({ size: sizeMapping[size] }),
      className,
    );

    const loadingCls = cn(
      loadingVariants.loading({ size: sizeMapping[size], color }),
    );

    const tipsProps = {
      tip: label ? (
        <div className={cn(loadingVariants.label({ labelSize }))}>{label}</div>
      ) : null,
      indicator: <IconCozLoading className={loadingCls} />,
    };

    return (
      <SemiLoading
        ref={ref}
        size="middle"
        spinning={loading}
        wrapperClassName={wrapperCls}
        {...tipsProps}
        {...restProps}
      >
        {children}
      </SemiLoading>
    );
  },
);

Loading.displayName = 'Loading';
