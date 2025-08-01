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

import { useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { type BasicTarget } from 'ahooks/lib/utils/domTarget';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { type DocumentChunk } from '@coze-data/knowledge-common-components/text-knowledge-editor/scenes/base';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { ChunkType } from '@coze-arch/bot-api/knowledge';

import { useScrollListSliceReq } from '@/service';

import { createBaseDocumentChunkBySliceInfo } from '../../utils/document-utils';

interface UseSliceDataParams {
  curDocId: string;
  datasetId: string;
  curChunkType?: ChunkType;
  processFinished: boolean;
  target?: BasicTarget;
  rollbackDocumentSelection: () => void;
}

/**
 * Hooks for processing document fragment data acquisition
 */
export const useSliceData = ({
  curDocId,
  datasetId,
  curChunkType,
  processFinished,
  target,
  rollbackDocumentSelection,
}: UseSliceDataParams) => {
  const { searchValue } = useKnowledgeStore(
    useShallow(state => ({
      searchValue: state.searchValue,
    })),
  );

  // Get document content
  const {
    loading,
    data: sliceData,
    mutate,
    reload,
  } = useScrollListSliceReq({
    target,
    params: {
      keyword: searchValue,
      document_id:
        // If it is a hierarchical segmentation, it is not requested.
        curChunkType !== ChunkType.LevelChunk ? curDocId : '',
    },
    reloadDeps: [searchValue, curDocId, datasetId, processFinished],
    onError: error => {
      /** When pulling a slice fails, roll back curDocId to avoid inconsistencies between the document title and content, and user confusion */
      dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
        eventName: ReportEventNames.KnowledgeGetSliceList,
        error,
      });

      Toast.error(I18n.t('knowledge_document_view'));
      rollbackDocumentSelection();
    },
  });

  // Use useMemo to cache the chunks array to avoid unnecessary recreations due to progressMap updates
  const renderData = useMemo(
    () =>
      sliceData?.list.map(item => createBaseDocumentChunkBySliceInfo(item)) ??
      [],
    [sliceData?.list],
  );

  // Handling content changes
  const handleContentChange = (chunks: DocumentChunk[]) => {
    mutate({
      ...sliceData,
      list: chunks,
      total: Number(sliceData?.total ?? '0'),
    });
  };

  return {
    loading,
    sliceData,
    renderData,
    handleContentChange,
    reload,
  };
};
