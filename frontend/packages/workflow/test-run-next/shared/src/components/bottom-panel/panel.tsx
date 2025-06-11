import React from 'react';

import { isObject } from 'lodash-es';
import { clsx } from 'clsx';
import { IconCozCross } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';

import { useResize } from './use-resize';

import css from './panel.module.less';

interface BasePanelProps {
  className?: string;
  /**
   * 面板头，不传不渲染
   */
  header?: React.ReactNode;
  /**
   * 面板脚，不传不渲染
   */
  footer?: React.ReactNode;
  /**
   * 默认初始高度，不支持响应式
   */
  height?: number;
  /**
   * 是否可拖拽改变高度
   */
  resizable?:
    | boolean
    | {
        min?: number;
        max?: number;
      };
  /**
   * 点击关闭事件，仅当渲染面板头时可能触发
   */
  onClose?: () => void;
}

export const BottomPanel: React.FC<React.PropsWithChildren<BasePanelProps>> = ({
  className,
  header,
  footer,
  height,
  resizable,
  onClose,
  children,
}) => {
  const {
    height: innerHeight,
    bind,
    ref,
    dragging,
  } = useResize({
    default: height,
    ...(isObject(resizable) ? resizable : {}),
  });

  return (
    <div
      className={clsx(css['base-panel'], className, dragging && css.dragging)}
      style={{ height: innerHeight }}
      ref={ref}
    >
      {resizable ? (
        <div className={css['resize-bar']} onMouseDown={bind} />
      ) : null}
      {header ? (
        <div className={css['panel-header']}>
          {header}
          <IconButton
            icon={<IconCozCross className={'text-[18px]'} />}
            color="secondary"
            onClick={onClose}
          />
        </div>
      ) : null}
      <div className={css['panel-content']}>{children}</div>
      {footer ? <div className={css['panel-footer']}>{footer}</div> : null}
    </div>
  );
};
