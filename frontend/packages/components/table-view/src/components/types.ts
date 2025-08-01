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

import { type ColumnProps } from '@coze-arch/bot-semi/Table';

export type TableViewValue = string | number | undefined;
export type TableViewRecord = {
  tableViewKey?: string;
} & Record<string, TableViewValue>;
export type TableViewColumns = ColumnProps<TableViewRecord>;

export enum TableViewMode {
  READ = 'read',
  EDIT = 'edit',
}

export enum EditMenuItem {
  EDIT = 'edit',
  DELETE = 'delete',
  DELETEALL = 'deleteAll',
}
export interface ValidatorProps {
  validate?: (
    value: string,
    record?: TableViewRecord,
    index?: number,
  ) => boolean;
  errorMsg?: string;
}
