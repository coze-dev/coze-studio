import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useKnowledgeParams, useKnowledgeStore } from '@coze-data/knowledge-stores';

import { useListDocumentReq } from '@/service/document';
import { useDataSetDetailReq } from '@/service/dataset';

export const useReloadKnowledgeIDE = () => {
  const { datasetID = '' } = useKnowledgeParams();
  const {
    run: fetchDataSetDetail,
    loading: isDataSetLoading,
    data: dataSetDetail,
  } = useDataSetDetailReq();
  const {
    run: fetchDocumentList,
    loading: isDocumentLoading,
    data: documentList,
  } = useListDocumentReq();

  const { setDataSetDetail, setDocumentList } = useKnowledgeStore(
    useShallow(state => ({
      setDataSetDetail: state.setDataSetDetail,
      setDocumentList: state.setDocumentList,
    })),
  );

  // 监听数据变化并更新 store
  useEffect(() => {
    if (!isDataSetLoading && dataSetDetail) {
      setDataSetDetail(dataSetDetail);
    }
  }, [dataSetDetail, isDataSetLoading]);

  useEffect(() => {
    if (!isDocumentLoading && documentList) {
      setDocumentList(documentList);
    }
  }, [documentList, isDocumentLoading]);
  return {
    loading: isDataSetLoading || isDocumentLoading,
    reload: () => {
      fetchDataSetDetail({ datasetID });
      fetchDocumentList({ datasetID });
    },
    reset: () => {
      setDataSetDetail({});
      setDocumentList([]);
    },
  };
};
