import { createPortal } from 'react-dom';
import React, {
  ComponentProps,
  FC,
  PropsWithChildren,
  useEffect,
  useRef,
} from 'react';

import { merge } from 'lodash-es';
import classNames from 'classnames';
import { Modal } from '@douyinfe/semi-ui';
import { IconClose } from '@douyinfe/semi-icons';

import { Button } from '../ui-button';
import { useGrab } from '../../hooks/use-grab';

import s from './index.module.less';

export type UIDragModalType =
  | 'info'
  | 'action-small'
  | 'action'
  | 'base-composition';

export type UIDragModalProps = ComponentProps<typeof Modal> & {
  type?: UIDragModalType;
  focusKey?: string;
  onWindowFocus?: (v: string) => void; // 当前窗口被点击时的回调
};

export const UIDragModal: FC<PropsWithChildren<UIDragModalProps>> = props => {
  const {
    className,
    style,
    visible,
    title,
    zIndex,
    footer,
    children,
    onCancel,

    type,
    focusKey,
    onWindowFocus,
  } = merge({}, UIDragModal.defaultProps, props);

  const grabAnchor = useRef<HTMLDivElement>(null);
  const grabTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unSubscribe: (() => void) | undefined;
    if (visible) {
      unSubscribe = subscribeGrab();
    }
    return () => {
      unSubscribe?.();
    };
  }, [visible]);

  const { subscribeGrab, grabbing } = useGrab({
    grabTarget,
    grabAnchor,
    isModifyStyle: true,
  });

  if (!visible) {
    return null;
  }

  return createPortal(
    <div className={s['drag-modal']}>
      <div
        className={classNames(
          s[`modal-${type}`],
          s['drag-modal-wrapper'],
          !!footer && s['footer-custom'],
          className,
        )}
        ref={grabTarget}
        onMouseDown={() => {
          !!focusKey && onWindowFocus?.(focusKey);
        }}
        style={{ ...style, zIndex }}
      >
        <div
          ref={grabAnchor}
          className={s['drag-modal-wrapper-title']}
          style={{ cursor: grabbing ? 'grabbing' : 'grab' }}
        >
          {title}
          <Button
            className={s['drag-modal-wrapper-close-btn']}
            onClick={onCancel}
            icon={<IconClose />}
            size="small"
            theme="borderless"
          />
        </div>
        <div className={s['drag-modal-wrapper-content']}>{children}</div>
        {footer ? (
          <div className={s['drag-modal-wrapper-footer']}>{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};

UIDragModal.defaultProps = {
  type: 'info',
};
