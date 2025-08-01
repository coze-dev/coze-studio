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

import React, { PropsWithChildren, ReactElement } from 'react';

import classNames from 'classnames';

import s from './index.module.less';

export type UIHeaderProps = PropsWithChildren<{
  className?: string;
  title?: string;
  breadcrumb?: ReactElement;
}>;
export const UIHeader: React.FC<UIHeaderProps> = ({
  className,
  children,
  title = '',
  breadcrumb,
}) => (
  <div
    className={classNames(s['ui-header'], className)}
    data-testid="ui.header"
  >
    {title && <div className={s.title}>{title}</div>}
    {!!breadcrumb && breadcrumb}
    {children}
  </div>
);

export default UIHeader;
