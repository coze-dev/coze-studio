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

import { type DatasetDataScrollList } from '@/service';

// Context related to table manipulation
interface TableActionsContextType {
  setCurIndex: (index: number | ((prev: number) => number)) => void;
  setCurSliceId: (id: string | ((prev: string) => string)) => void;
  setDelSliceIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  loadMoreSliceList: () => void;
  mutateSliceListData: (data: DatasetDataScrollList) => void;
}

export const TableActionsContext =
  createContext<TableActionsContextType | null>(null);

export const useTableActions = () => {
  const context = useContext(TableActionsContext);
  if (!context) {
    throw new Error(
      'useTableActions must be used within a TableActionsProvider',
    );
  }
  return context;
};
