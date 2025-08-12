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

import { IconCozEdit, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { type RowKey } from '@coze-arch/bot-semi/Table';

import {
  type TableViewRecord,
  type TableViewColumns,
  EditMenuItem,
} from '../types';

const FIXED_COLUMN_WIDTH = 38;
const MIN_COLUMN_WIDTH = 100;

export interface GetRowOpConfig {
  selected: {
    record?: TableViewRecord;
    indexs?: (string | number)[];
  };
  onEdit?: (
    record: TableViewRecord,
    index: string | number,
  ) => void | Promise<void>;
  onDelete?: (indexs: (string | number)[]) => void | Promise<void>;
}

/**
 * Callbacks when table columns are scaled to limit the scaling boundaries
 * @param column
 * @returns
 */
export const resizeFn = (column: TableViewColumns): TableViewColumns => {
  if (column.fixed || column.key === 'column-selection') {
    return {
      ...column,
      resizable: false,
      width: FIXED_COLUMN_WIDTH,
    };
  }
  return {
    ...column,
    width:
      Number(column.width) < MIN_COLUMN_WIDTH
        ? MIN_COLUMN_WIDTH
        : Number(column.width),
  };
};

export const getRowKey: RowKey<TableViewRecord> = (record?: TableViewRecord) =>
  record?.tableViewKey || '';

/**
 * Get row operation configuration
 * @param record
 * @param indexs
 * @param onEdit
 * @param onDelete
 * @returns
 */
export const getRowOpConfig = ({
  selected,
  onEdit,
  onDelete,
}: GetRowOpConfig) => {
  const { record, indexs } = selected;
  const DeleteFn = () => {
    if (onDelete && indexs) {
      onDelete(indexs);
    }
  };
  const deleteConfig = {
    text: 'knowledge_tableview_02',
    icon: <IconCozTrashCan />,
    onClick: DeleteFn,
  };
  const editMenuConfig = {
    [EditMenuItem.EDIT]: {
      text: 'knowledge_tableview_01',
      icon: <IconCozEdit />,
      onClick: () => {
        if (onEdit && record && indexs) {
          onEdit(record, indexs[0]);
        }
      },
    },
    [EditMenuItem.DELETE]: deleteConfig,
    [EditMenuItem.DELETEALL]: deleteConfig,
  };
  return editMenuConfig;
};
