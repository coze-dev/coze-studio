import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useKnowledgeParams, useKnowledgeStore } from '@coze-data/knowledge-stores';

import { useDataSetDetailReq } from '@/service/dataset';
export const useGetKnowledgeType = () => {
  const { datasetID = '' } = useKnowledgeParams();
  // 知识库详情
  const { data: dataSetDetail, run: fetchDataSetDetail } =
    useDataSetDetailReq();
  const { setDataSetDetail, dataSetDetail: storeDataSetDetail } =
    useKnowledgeStore(
      useShallow(state => ({
        setDataSetDetail: state.setDataSetDetail,
        dataSetDetail: state.dataSetDetail,
      })),
    );

  useEffect(() => {
    if (storeDataSetDetail.dataset_id) {
      return;
    }
    fetchDataSetDetail({ datasetID });
  }, []);

  useEffect(() => {
    setDataSetDetail(dataSetDetail || {});
    return () => {
      setDataSetDetail({});
    };
  }, [dataSetDetail]);

  return {
    dataSetDetail,
  };
};
