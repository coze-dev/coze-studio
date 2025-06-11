import React, { useRef, useState, forwardRef } from 'react';

import cls from 'classnames';
import { useHover } from 'ahooks';
import { IconCozArrowDownFill } from '@coze/coze-design/icons';
import { Collapsible } from '@coze/coze-design';

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
