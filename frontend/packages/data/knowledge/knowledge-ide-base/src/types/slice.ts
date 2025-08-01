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

import { type TableViewRecord } from '@coze-common/table-view';
import { type DocTableColumn } from '@coze-arch/bot-api/memory';
import { type SliceInfo } from '@coze-arch/bot-api/knowledge';

export type ISliceInfo = SliceInfo & { addId?: string; id?: string };

export interface TranSliceListParams {
  sliceList: ISliceInfo[];
  metaData?: DocTableColumn[];
  canEdit: boolean;
  tableKey: string;
  onEdit?: (record, index: number) => void;
  onDelete?: (indexs: number[]) => void;
  onUpdate?: (record: TableViewRecord, index: number, value?: string) => void;
}

/** Where the slice is inserted */
export type TPosition = 'top' | 'bottom';
