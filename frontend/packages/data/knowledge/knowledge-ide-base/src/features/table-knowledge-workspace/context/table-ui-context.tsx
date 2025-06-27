import { createContext, useContext } from 'react';
import { type MutableRefObject } from 'react';

import { type TableViewMethods } from '@coze-common/table-view';

// 表格 UI 相关的 Context
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
