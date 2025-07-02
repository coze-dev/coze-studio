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
