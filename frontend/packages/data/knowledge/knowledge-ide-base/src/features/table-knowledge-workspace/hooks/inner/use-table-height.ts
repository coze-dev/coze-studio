import { useEffect, useState } from 'react';

import { useTableUI } from '../../context/table-ui-context';
import { useTableData } from '../../context/table-data-context';

export const useTableHeight = () => {
  const { tableViewRef, isShowAddBtn } = useTableUI();
  const { sliceListData } = useTableData();
  const [tableH, setTableHeight] = useState<number | string>(0);

  // 更新表格高度
  useEffect(() => {
    const h = tableViewRef?.current?.getTableHeight();
    if (h) {
      setTableHeight(isShowAddBtn ? h : '100%');
    }
  }, [sliceListData, isShowAddBtn, tableViewRef]);

  const increaseTableHeight = (addBtnHeight: number) => {
    setTableHeight(Number(tableH ?? '0') + addBtnHeight);
  };

  return {
    tableH,
    increaseTableHeight,
  };
};
