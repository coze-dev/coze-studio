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

import { nanoid } from 'nanoid';

import { type ISliceInfo } from '@/types/slice';

import { useTableData } from '../../context/table-data-context';
import { useTableActions } from '../../context/table-actions-context';

const ADD_BTN_HEIGHT = 56;

interface UseAddRowProps {
  increaseTableHeight: (height: number) => void;
  scrollTableBodyToBottom: () => void;
}

export const useAddRow = ({
  increaseTableHeight,
  scrollTableBodyToBottom,
}: UseAddRowProps) => {
  const { sliceListData } = useTableData();
  const { mutateSliceListData } = useTableActions();
  const handleAddRow = () => {
    /** Increase the height of the container first */
    increaseTableHeight(ADD_BTN_HEIGHT);
    const items = JSON.parse(sliceListData?.list[0]?.content ?? '[]');

    const addItemContent = items?.map(v => ({
      ...v,
      value: '',
      char_count: 0,
      hit_count: 0,
    }));

    mutateSliceListData({
      ...sliceListData,
      total: Number(sliceListData?.total ?? '0'),
      list: sliceListData?.list.concat([
        { content: JSON.stringify(addItemContent), addId: nanoid() },
      ]) as ISliceInfo[],
    });

    scrollTableBodyToBottom();
  };

  return {
    handleAddRow,
  };
};
