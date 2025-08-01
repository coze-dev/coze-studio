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

import { createContext, useContext } from 'react';
import { type MutableRefObject } from 'react';

import { type TableViewMethods } from '@coze-common/table-view';

// Context related to table UI
interface TableUIContextType {
  tableViewRef: MutableRefObject<TableViewMethods | null>;
  isLoadingMoreSliceList: boolean;
  isLoadingSliceList: boolean;
  isShowAddBtn: boolean;
}

export const TableUIContext = createContext<TableUIContextType | null>(null);

export const useTableUI = () => {
  const context = useContext(TableUIContext);
  if (!context) {
    throw new Error('useTableUI must be used within a TableUIProvider');
  }
  return context;
};
