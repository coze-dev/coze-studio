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

import { type ColumnProps } from '@coze-arch/coze-design';

import { type TableRow } from '../components/database-table-data/type';

const FIXED_COLUMN_WIDTH = 60;
const MIN_COLUMN_WIDTH = 100;
/**
 * Callbacks when table columns are scaled to limit the scaling boundaries
 * @param column
 * @returns
 */
export const resizeFn = (
  column: ColumnProps<TableRow>,
): ColumnProps<TableRow> => {
  // The checkbox/serial number column is not retractable
  if (column.key === 'column-selection') {
    return {
      ...column,
      resizable: false,
      width: FIXED_COLUMN_WIDTH,
    };
  }
  // Fixed columns (action columns) are not scalable
  if (column.fixed) {
    return {
      ...column,
      resizable: false,
    };
  }
  // The remaining field columns are scalable, but the minimum width needs to be limited
  return {
    ...column,
    width:
      Number(column.width) < MIN_COLUMN_WIDTH
        ? MIN_COLUMN_WIDTH
        : Number(column.width),
  };
};
