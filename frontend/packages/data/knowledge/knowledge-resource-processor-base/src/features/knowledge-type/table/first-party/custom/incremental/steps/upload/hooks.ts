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

import { useCallback, useRef, useState, useEffect } from 'react';

import { type TableDataItem } from '@coze-data/knowledge-modal-base';
import { type TableViewRecord } from '@coze-common/table-view';
import { type DocTableColumn } from '@coze-arch/bot-api/memory';

import { transformTableData } from './utils';

interface UseTableOperationsParams {
  initialData?: TableViewRecord[];
  createTableSegment?: () => void;
  editTableSegment?: (data: string | TableDataItem[]) => void;
}
function useTableOperations({
  initialData = [],
  editTableSegment,
}: UseTableOperationsParams) {
  const [tableData, setTableData] = useState<TableViewRecord[]>(initialData);
  const tableDataRef = useRef<TableViewRecord[]>(initialData);
  const sheetStructureRef = useRef<DocTableColumn[]>([]);
  const [editItemIndex, setEditItemIndex] = useState<number>(-1);

  const handleCellUpdate = useCallback(
    (_record: TableViewRecord, index: number) => {
      setTableData(prevData =>
        prevData.map((item, i) => {
          if (i === index) {
            return { ...item, ..._record };
          }
          return item;
        }),
      );
    },
    [tableData],
  );
  const handleDel = useCallback(
    (indexList: (string | number)[]) => {
      const currentTableData = tableDataRef.current;
      const newTableData = [...currentTableData];
      indexList.forEach(index => {
        newTableData.splice(Number(index), 1);
      });
      setTableData(newTableData);
    },
    [tableDataRef.current],
  );

  const handleEdit = useCallback(
    (record: TableViewRecord, index: string | number) => {
      const currentTableData = tableDataRef.current;
      setEditItemIndex(Number(index));
      const curTableItem = currentTableData[Number(index)];
      const curTableItemKeys = Object.keys(curTableItem);
      const editTableData = curTableItemKeys.map(key => {
        const sItem = sheetStructureRef.current.find(
          item => item.column_name === key,
        );
        return {
          column_name: sItem?.column_name || '',
          column_id: sItem?.id || '',
          is_semantic: Boolean(sItem?.is_semantic),
          value: curTableItem[key] as string,
        };
      });
      editTableSegment?.(editTableData);
    },
    [sheetStructureRef.current, tableDataRef.current],
  );
  const handleAdd = useCallback(() => {
    const tableDataItem = transformTableData<DocTableColumn>(
      sheetStructureRef.current,
      'column_name',
    );
    const currentTableData = tableDataRef.current;
    setTableData([...currentTableData, ...tableDataItem]);
  }, [tableDataRef.current]);

  useEffect(() => {
    tableDataRef.current = tableData;
  }, [tableData]);

  return {
    editItemIndex,
    tableData,
    setTableData,
    handleCellUpdate,
    handleAdd,
    handleDel,
    handleEdit,
    tableDataRef,
    sheetStructureRef,
  };
}

export default useTableOperations;
