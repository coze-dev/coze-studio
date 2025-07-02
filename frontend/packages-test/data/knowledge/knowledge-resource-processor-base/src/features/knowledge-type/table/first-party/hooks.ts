import { useEffect } from 'react';

import { type StoreApi, type UseBoundStore } from 'zustand';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';

import { useListDocumentReq } from '@/services';

import { type UploadTableAction, type UploadTableState } from '../interface';

export const useTableCheck = (
  store: UseBoundStore<
    StoreApi<UploadTableState<number> & UploadTableAction<number>>
  >,
) => {
  const params = useKnowledgeParams();
  const setDocumentList = store(state => state.setDocumentList);

  const listDocument = useListDocumentReq(res => {
    const { document_infos = [] } = res;
    setDocumentList && setDocumentList(document_infos);
  });

  useEffect(() => {
    listDocument({
      dataset_id: params.datasetID ?? '',
      document_ids: params.docID ? [params.docID] : undefined,
    });
  }, []);
  return null;
};
