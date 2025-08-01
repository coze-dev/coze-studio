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

import { ColumnsTitle, type ColumnsTitleProps } from '../columns-title';

export interface ColumnsTitleWithActionProps extends ColumnsTitleProps {
  actionWidth?: number;
  readonly?: boolean;
  className?: string;
  style?: CSSProperties;
}

const getActionColumns = (
  columns: ColumnsTitleProps['columns'],
  readonly?: boolean,
  actionWidth = 24,
) => [
  ...columns,
  ...(readonly
    ? []
    : [
        {
          title: '',
          style: {
            width: actionWidth,
          },
        },
      ]),
];

export const ColumnsTitleWithAction = ({
  actionWidth,
  className,
  columns,
  readonly,
  style,
}: ColumnsTitleWithActionProps) => (
  <ColumnsTitle
    className={classnames('gap-1', className)}
    columns={getActionColumns(columns, readonly, actionWidth)}
    style={style}
  />
);
