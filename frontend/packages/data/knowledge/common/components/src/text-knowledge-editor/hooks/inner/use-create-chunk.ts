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

import { useRequest } from 'ahooks';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { CustomError } from '@coze-arch/bot-error';
import { KnowledgeApi } from '@coze-arch/bot-api';

import { createRemoteChunk } from '@/text-knowledge-editor/services/inner/chunk-op.service';

export interface UseCreateChunkProps {
  documentId: string;
}

export const useCreateChunk = ({ documentId }: UseCreateChunkProps) => {
  const { runAsync } = useRequest(
    async (props: { content: string; sequence: string }) => {
      const { content, sequence } = props;
      if (!documentId) {
        throw new CustomError('normal_error', 'missing doc_id');
      }

      const data = await KnowledgeApi.CreateSlice({
        document_id: documentId,
        raw_text: content,
        sequence,
      });

      const chunk = createRemoteChunk({
        slice_id: data?.slice_id ?? '',
        sequence,
        content,
      });

      return chunk;
    },
    {
      manual: true,
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeCreateSlice,
          error,
        });
      },
    },
  );

  return {
    createChunk: runAsync,
  };
};
