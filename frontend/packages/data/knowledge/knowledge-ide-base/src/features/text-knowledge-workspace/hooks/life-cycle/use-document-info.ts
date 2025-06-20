import { useShallow } from 'zustand/react/shallow';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { DocumentStatus } from '@coze-arch/bot-api/knowledge';

import { type ProgressMap } from '@/types';

/**
 * 处理文档基本信息的 hook
 */
export const useDocumentInfo = (progressMap: ProgressMap) => {
  const { documentList, dataSetDetail, curDocId } = useKnowledgeStore(
    useShallow(state => ({
      curDocId: state.curDocId,
      documentList: state.documentList,
      dataSetDetail: state.dataSetDetail,
    })),
  );

  // 当前文档
  const curDoc = documentList?.find(i => i.document_id === curDocId);

  // 处理状态
  const isProcessing = curDoc?.status === DocumentStatus.Processing;
  const processFinished = curDocId
    ? progressMap[curDocId]?.status === DocumentStatus.Enable
    : false;

  // 数据集ID
  const datasetId = dataSetDetail?.dataset_id ?? '';

  return {
    curDoc,
    curDocId,
    isProcessing,
    processFinished,
    datasetId,
  };
};
