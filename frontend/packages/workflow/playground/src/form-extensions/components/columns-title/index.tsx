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

import { type CSSProperties } from 'react';

import classnames from 'classnames';

import { type AnyValue } from '../../setters/typings';

import styles from './index.module.less';

export interface Column {
  title: string;
  style?: AnyValue;
}
export interface ColumnsTitleProps {
  columns: Column[];
  className?: string;
  style?: CSSProperties;
}

export const ColumnsTitle = ({
  columns,
  className,
  style,
}: ColumnsTitleProps) => (
  <div className={classnames(styles.columnsTitle, className)} style={style}>
    {columns.map(({ title, style: colStyle }: Column) => (
      <div style={colStyle}>{title}</div>
    ))}
  </div>
);
