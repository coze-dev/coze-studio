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
