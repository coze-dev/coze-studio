import { useTableData } from '../../context/table-data-context';

const ADD_BTN_HEIGHT = 56;

export const useScroll = () => {
  const { sliceListData } = useTableData();
  // 滚动表格到底部
  const scrollTableBodyToBottom = () => {
    const bodyDom = document.querySelector(
      '.table-view-box .semi-table-container>.semi-table-body',
    );
    if (bodyDom && sliceListData?.list.length) {
      bodyDom.scrollTop = sliceListData?.list.length * ADD_BTN_HEIGHT;
    }
  };

  return {
    scrollTableBodyToBottom,
  };
};
