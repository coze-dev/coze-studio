import React from 'react';

import classNames from 'classnames';

import { ExpandableArrow } from './expandable-arrow';

import styles from './resource-group.module.less';
export interface ResourceGroupProps {
  title: string;
  expand?: boolean;
  className?: string;
  onExpandChange?: (expand: boolean) => void;
  actions?: React.ReactNode;
  content?: React.ReactNode;
}

export const ResourceGroup = ({
  title,
  actions,
  content,
  expand,
  onExpandChange,
  className,
}: ResourceGroupProps) => (
  <div className={classNames(className, styles['resource-group'])}>
    <div
      className={styles['resource-group-header']}
      onClick={() => onExpandChange?.(!expand)}
    >
      <div className={styles['header-left']}>
        <ExpandableArrow expand={expand} />
        <span className={styles['header-title']}>{title}</span>
      </div>
      {actions ? <div className={styles['action-group']}>{actions}</div> : null}
    </div>
    <div
      className={styles['resource-group-content']}
      style={expand ? undefined : { display: 'none' }}
    >
      {content}
    </div>
  </div>
);
