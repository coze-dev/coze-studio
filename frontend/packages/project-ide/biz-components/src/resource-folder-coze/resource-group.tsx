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
