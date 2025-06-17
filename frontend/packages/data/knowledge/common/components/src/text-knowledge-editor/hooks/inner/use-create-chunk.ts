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
