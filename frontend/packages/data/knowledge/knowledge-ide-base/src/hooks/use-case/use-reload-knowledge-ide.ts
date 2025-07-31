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

import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  useKnowledgeParams,
  useKnowledgeStore,
} from '@coze-data/knowledge-stores';

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

  // Monitor data changes and update store
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
