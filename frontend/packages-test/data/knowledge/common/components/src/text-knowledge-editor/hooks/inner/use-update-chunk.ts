import { useRequest } from 'ahooks';
import { CustomError } from '@coze-arch/bot-error';
import { KnowledgeApi } from '@coze-arch/bot-api';

export const useUpdateChunk = () => {
  const { runAsync: updateSlice, loading: updateLoading } = useRequest(
    async (sliceId: string, updateContent: string) => {
      if (!sliceId) {
        throw new CustomError('normal_error', 'missing slice_id');
      }
      await KnowledgeApi.UpdateSlice({
        slice_id: sliceId,
        raw_text: updateContent,
      });
      return updateContent;
    },
    {
      manual: true,
    },
  );
  return {
    updateSlice,
    updateLoading,
  };
};
