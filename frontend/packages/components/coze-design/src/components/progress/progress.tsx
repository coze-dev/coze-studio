import { forwardRef, useMemo, type JSX, type FC } from 'react';

import { cn, mergeProps } from '@/utils';
import { Progress as SemiProgress } from '@/components/semi';

import { progressVariants } from './progress-variant';
import { type ProgressProps } from './progress-types';

import './index.css';

const lineHeightMap = {
  small: 3,
  default: 4,
  large: 6,
};

const circleMap = {
  small: { circleStrokeWidth: 2, circleWidth: 26 },
  default: { circleStrokeWidth: 2, circleWidth: 28 },
  large: { circleStrokeWidth: 3, circleWidth: 32 },
};

const defaultProps: Partial<ProgressProps> = {
  size: 'default',
  type: 'line',
  stroke: 'var(--coz-fg-hglt)',
};

export const Progress: FC<ProgressProps> = forwardRef<
  SemiProgress,
  ProgressProps
>((props, ref): JSX.Element => {
  const {
    dataTheme,
    className,
    style,
    height,
    width,
    strokeWidth,
    type = 'line',
    size = 'default',
    ...restProps
  } = mergeProps(props, defaultProps);

  const cls = cn(progressVariants({ type }), className);

  const circleStyle = useMemo(
    () => ({
      width: width ?? circleMap[size].circleWidth,
      strokeWidth: strokeWidth ?? circleMap[size].circleStrokeWidth,
    }),
    [width, strokeWidth, size],
  );

  const lineStyle = useMemo(
    () =>
      // 条件判断，只有当type等于'line'时才设置height属性
      type === 'line' ? { height: height ?? lineHeightMap[size] } : {},
    [type, height, size],
  );

  const mergeLineStyle = {
    ...lineStyle,
    ...style,
  };

  return (
    <SemiProgress
      ref={ref}
      size={size}
      type={type}
      className={cls}
      data-theme={dataTheme}
      style={mergeLineStyle}
      {...circleStyle}
      {...restProps}
    />
  );
});

Progress.displayName = 'Progress';
