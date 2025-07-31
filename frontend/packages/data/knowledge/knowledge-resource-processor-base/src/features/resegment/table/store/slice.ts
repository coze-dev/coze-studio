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

import { type StateCreator } from 'zustand';

import {
  createTableSlice,
  getDefaultState,
} from '@/features/knowledge-type/table/slice';
import type {
  UploadTableAction,
  UploadTableState,
} from '@/features/knowledge-type/table/interface';
import { DEFAULT_TABLE_SETTINGS_FROM_ZERO } from '@/constants';

export const createTableLocalResegmentSlice: StateCreator<
  UploadTableState<number> & UploadTableAction<number>
> = (set, get, store) => ({
  ...createTableSlice(set, get, store),
  tableSettings: DEFAULT_TABLE_SETTINGS_FROM_ZERO,
  reset: () => {
    set({
      ...getDefaultState(),
      tableSettings: DEFAULT_TABLE_SETTINGS_FROM_ZERO,
    });
  },
});
