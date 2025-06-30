import { createContext, useContext } from 'react';

import { type DatasetDataScrollList } from '@/service';

// 表格数据相关的 Context
interface TableDataContextType {
  sliceListData: DatasetDataScrollList;
  curIndex: number;
  curSliceId: string;
  delSliceIds: string[];
}

export const TableDataContext = createContext<TableDataContextType | null>(
  null,
);

export const useTableData = () => {
  const context = useContext(TableDataContext);
  if (!context) {
    throw new Error('useTableData must be used within a TableDataProvider');
  }
  return context;
};
