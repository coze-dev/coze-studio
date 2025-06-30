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
    /** 先增加容器的高度 */
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
