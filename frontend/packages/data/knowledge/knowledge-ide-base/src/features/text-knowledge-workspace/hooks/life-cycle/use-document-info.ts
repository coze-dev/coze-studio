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

import { useShallow } from 'zustand/react/shallow';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { DocumentStatus } from '@coze-arch/bot-api/knowledge';

import { type ProgressMap } from '@/types';

/**
 * Hooks that handle basic information about documents
 */
export const useDocumentInfo = (progressMap: ProgressMap) => {
  const { documentList, dataSetDetail, curDocId } = useKnowledgeStore(
    useShallow(state => ({
      curDocId: state.curDocId,
      documentList: state.documentList,
      dataSetDetail: state.dataSetDetail,
    })),
  );

  // current document
  const curDoc = documentList?.find(i => i.document_id === curDocId);

  // processing state
  const isProcessing = curDoc?.status === DocumentStatus.Processing;
  const processFinished = curDocId
    ? progressMap[curDocId]?.status === DocumentStatus.Enable
    : false;

  // Dataset ID
  const datasetId = dataSetDetail?.dataset_id ?? '';

  return {
    curDoc,
    curDocId,
    isProcessing,
    processFinished,
    datasetId,
  };
};
