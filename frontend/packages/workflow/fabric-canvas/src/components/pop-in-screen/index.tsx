/* eslint-disable complexity */
import { useEffect, useRef, useState, type FC } from 'react';

import classNames from 'classnames';
import { useSize } from 'ahooks';

import { getNumberBetween } from '../../utils';

import styles from './index.module.less';

interface IProps {
  left?: number;
  top?: number;
  offsetY?: number;
  offsetX?: number;
  children?: React.ReactNode;
  position?: 'bottom-center' | 'bottom-right' | 'top-center';
  zIndex?: number;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  limitRect?: {
    width?: number;
    height?: number;
  };
}
export const PopInScreen: FC<IProps> = props => {
  const ref = useRef(null);
  const {
    left = 0,
    top = 0,
    children,
    position = 'bottom-center',
    zIndex = 1000,
    onClick,
    className,
    limitRect,
  } = props;
  // const documentSize = useSize(document.body);
  const childrenSize = useSize(ref.current);
  let maxLeft = (limitRect?.width ?? Infinity) - (childrenSize?.width ?? 0) / 2;
  let minLeft = (childrenSize?.width ?? 0) / 2;
  let transform = 'translate(-50%, 0)';

  if (position === 'bottom-right') {
    maxLeft = (limitRect?.width ?? Infinity) - (childrenSize?.width ?? 0);
    minLeft = 0;
    transform = 'translate(0, 0)';
  } else if (position === 'top-center') {
    transform = 'translate(-50%, -100%)';
  }

  /**
   * ahooks useSize 初次执行会返回 undefined，导致组件位置计算错误
   * 这里监听 childrenSize ，如果为 undefined 则延迟 100ms 再渲染，以修正组件位置
   */
  const [id, setId] = useState('');
  const timer = useRef<NodeJS.Timeout>();
  useEffect(() => {
    clearTimeout(timer.current);
    if (!childrenSize) {
      timer.current = setTimeout(() => {
        setId(`${Math.random()}`);
      }, 100);
    }
  }, [childrenSize]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={classNames([
        styles['pop-in-screen'],
        '!fixed',
        'coz-tooltip semi-tooltip-wrapper',
        'p-0',
        className,
      ])}
      style={{
        left: getNumberBetween({
          value: left,
          max: maxLeft,
          min: minLeft,
        }),
        top: getNumberBetween({
          value: top,
          max: (limitRect?.height ?? Infinity) - (childrenSize?.height ?? 0),
          min: position === 'top-center' ? (childrenSize?.height ?? 0) : 0,
        }),

        zIndex,
        opacity: 1,
        maxWidth: 'unset',
        transform,
      }}
    >
      {/* 为了触发二次渲染 */}
      <div className="hidden" id={id} />
      {children}
    </div>
  );
};
