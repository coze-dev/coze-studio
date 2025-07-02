import { useRef } from 'react';

import { type TableData } from '../components/database-table-data/type';

export const useGetTableInstantaneousData = (tableData: TableData) => {
  // 缓存 Data 数据，用于在事件中获取数据
  const dataRef = useRef<TableData>(tableData);
  dataRef.current = tableData;

  return () => dataRef.current;
};
