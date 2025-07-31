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
      {/* Floating head */}
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
        {/* head slot */}
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
