import { createContext, useContext } from 'react';

import { type DatasetDataScrollList } from '@/service';

// 表格操作相关的 Context
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
