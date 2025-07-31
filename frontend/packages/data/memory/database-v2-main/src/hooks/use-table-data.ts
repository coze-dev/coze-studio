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

import { useMemo, useState } from 'react';

import { produce } from 'immer';

import {
  RowServiceStatus,
  type TableData,
} from '../components/database-table-data/type';

export const useTableData = (_tableData: TableData) => {
  const [tableData, setTableData] = useState(_tableData);

  const filteredTableData = useMemo(
    () =>
      produce(tableData, draft => {
        draft.dataList = draft.dataList.filter(
          item => item.status !== RowServiceStatus.Deleted,
        );
      }),
    [tableData],
  );

  return { tableData: filteredTableData, setTableData };
};
