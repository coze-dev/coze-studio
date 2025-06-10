import React, { type PropsWithChildren, type ReactNode } from 'react';

import classNames from 'classnames';

import styles from './index.module.less';

export interface SingleSheetProps extends PropsWithChildren {
  containerClassName?: string;
  headerClassName?: string;
  title?: string;
  titleNode?: ReactNode;
  titleClassName?: string;
  headerSlotClassName?: string;
  renderContent?: (headerNode: ReactNode) => ReactNode;
}

export function SingleSheet({
  containerClassName,
  headerClassName,
  titleClassName,
  title,
  titleNode,
  children,
  headerSlotClassName,
  renderContent,
}: SingleSheetProps) {
  const headerNode = (
    <div className={classNames(styles.card, containerClassName)}>
      {/* 浮层头部 */}
      <div className={classNames(styles['sheet-header'], headerClassName)}>
        <div
          className={classNames(
            styles['sheet-header-title'],
            'coz-fg-plus',
            titleClassName,
          )}
        >
          {title}
        </div>
        {/* 头部插槽 */}
        <div
          className={classNames(
            styles['sheet-header-scope'],
            headerSlotClassName,
          )}
        >
          {titleNode}
        </div>
      </div>
      {children}
    </div>
  );
  return renderContent ? <>{renderContent(headerNode)}</> : headerNode;
}
