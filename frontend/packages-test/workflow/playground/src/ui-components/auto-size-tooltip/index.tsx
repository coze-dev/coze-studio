import React, { type PropsWithChildren, useRef } from 'react';

import classNames from 'classnames';
import { Tooltip, type TooltipProps } from '@coze-arch/coze-design';

import styles from './index.module.less';

type AutoSizeTooltipProps = PropsWithChildren<
  {
    className?: string;
    style?: React.CSSProperties;
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
    tooltipClassName?: string;
    tooltipStyle?: React.CSSProperties;
  } & Omit<TooltipProps, 'className' | 'style'>
>;

export default function AutoSizeTooltip({
  children,
  className,
  style,
  tooltipClassName,
  tooltipStyle,
  containerClassName,
  containerStyle,
  ...rest
}: AutoSizeTooltipProps) {
  const nanoRef = useRef<HTMLDivElement | null>(null);
  const renderContent = () => (
    <>
      <div
        ref={nanoRef}
        className={classNames(styles.nano, containerClassName)}
        style={containerStyle}
      />
      <Tooltip
        {...rest}
        className={classNames(
          styles.tooltip,
          styles['top-level'],
          tooltipClassName,
        )}
        style={{ left: 0, ...tooltipStyle }}
      >
        {children}
      </Tooltip>
    </>
  );
  return (
    <div
      className={classNames(styles.popup_container, className)}
      style={style}
    >
      {renderContent()}
    </div>
  );
}
