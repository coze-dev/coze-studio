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

import { useEffect, useState } from 'react';

import { useTableUI } from '../../context/table-ui-context';
import { useTableData } from '../../context/table-data-context';

export const useTableHeight = () => {
  const { tableViewRef, isShowAddBtn } = useTableUI();
  const { sliceListData } = useTableData();
  const [tableH, setTableHeight] = useState<number | string>(0);

  // Update table height
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
