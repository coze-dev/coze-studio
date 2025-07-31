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

import React, { useRef, useState, forwardRef } from 'react';

import cls from 'classnames';
import { useHover } from 'ahooks';
import { IconCozArrowDownFill } from '@coze-arch/coze-design/icons';
import { Collapsible } from '@coze-arch/coze-design';

import styles from './collapse.module.less';

interface CollapseProps {
  label: React.ReactNode;
  extra?: React.ReactNode;
  titleSticky?: boolean;
  contentClassName?: string;
  titleClassName?: string;
  className?: string;
  extraClassName?: string;
  fade?: boolean;
  duration?: number;
}

export const Collapse = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<CollapseProps>
>(
  (
    {
      label,
      extra,
      children,
      contentClassName,
      titleClassName,
      titleSticky,
      className,
      extraClassName,
      fade,
      duration,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(true);
    const titleRef = useRef<HTMLDivElement>(null);
    const isTitleHover = useHover(() => titleRef.current);

    return (
      <div ref={ref} className={className}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          ref={titleRef}
          className={cls(
            'cursor-pointer',
            styles['collapse-title'],
            {
              [styles['collapse-title-sticky']]: titleSticky,
            },
            titleClassName,
          )}
        >
          <IconCozArrowDownFill
            className={cls(
              styles['collapse-icon'],
              !isOpen && styles['is-close'],
              isTitleHover && styles['is-show'],
            )}
          />
          <span className={styles['collapse-label']}>{label}</span>

          {extra ? (
            <div
              className={cls(styles['collapse-extra'], extraClassName)}
              onClick={e => e.stopPropagation()}
            >
              {extra}
            </div>
          ) : null}
        </div>
        <Collapsible
          className={contentClassName}
          isOpen={isOpen}
          keepDOM
          fade={fade}
          duration={duration}
        >
          {children}
        </Collapsible>
      </div>
    );
  },
);
