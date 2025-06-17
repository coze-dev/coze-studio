import { useRequest } from 'ahooks';
import { CustomError } from '@coze-arch/bot-error';
import { KnowledgeApi } from '@coze-arch/bot-api';

export const useDeleteChunk = () => {
  const { runAsync: deleteSlice } = useRequest(
    async (sliceId: string) => {
      if (!sliceId) {
        throw new CustomError('normal_error', 'missing slice_id');
      }
      await KnowledgeApi.DeleteSlice({
        slice_ids: [sliceId],
      });
    },
    {
      manual: true,
    },
  );
  return {
    deleteSlice,
  };
};
