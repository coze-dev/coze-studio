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

import React from 'react';

import { isObject } from 'lodash-es';
import { clsx } from 'clsx';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { useResize } from './use-resize';

import css from './panel.module.less';

interface BasePanelProps {
  className?: string;
  /**
   * Panel header, no pass and no render
   */
  header?: React.ReactNode;
  /**
   * Panel foot, do not pass and do not render
   */
  footer?: React.ReactNode;
  /**
   * Default initial height, does not support responsive
   */
  height?: number;
  /**
   * Can you drag and drop to change the height?
   */
  resizable?:
    | boolean
    | {
        min?: number;
        max?: number;
      };
  /**
   * Click to close the event, which may only be triggered when rendering the panel header
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
