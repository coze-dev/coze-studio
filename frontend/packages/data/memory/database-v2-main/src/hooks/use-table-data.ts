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
