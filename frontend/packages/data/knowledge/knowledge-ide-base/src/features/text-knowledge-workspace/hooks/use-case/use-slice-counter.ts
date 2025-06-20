import { useShallow } from 'zustand/react/shallow';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';

/**
 * 处理文档片段计数的 hook
 */
export const useSliceCounter = () => {
  const { dataSetDetail, setDataSetDetail } = useKnowledgeStore(
    useShallow(state => ({
      dataSetDetail: state.dataSetDetail,
      setDataSetDetail: state.setDataSetDetail,
    })),
  );

  // 处理添加块时更新计数
  const handleIncreaseSliceCount = () => {
    if (!dataSetDetail) {
      return;
    }

    setDataSetDetail({
      ...dataSetDetail,
      slice_count:
        // @ts-expect-error -- linter-disable-autofix
        dataSetDetail.slice_count > -1
          ? // @ts-expect-error -- linter-disable-autofix
            dataSetDetail.slice_count + 1
          : 0,
    });
  };

  // 处理删除块时更新计数
  const handleDecreaseSliceCount = () => {
    if (!dataSetDetail) {
      return;
    }

    setDataSetDetail({
      ...dataSetDetail,
      slice_count:
        // @ts-expect-error -- linter-disable-autofix
        dataSetDetail.slice_count > -1
          ? // @ts-expect-error -- linter-disable-autofix
            dataSetDetail.slice_count - 1
          : 0,
    });
  };

  return {
    handleIncreaseSliceCount,
    handleDecreaseSliceCount,
  };
};
