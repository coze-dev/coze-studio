/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  onWindowFocus?: (v: string) => void; // Callback when the current window is clicked
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
