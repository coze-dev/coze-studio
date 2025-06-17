import { useRequest } from 'ahooks';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { useErrorHandler } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

export const useGetKnowledgeListInfo = (params: { datasetID: string }) => {
  const spaceId = useSpaceStore(s => s.space.id);
  const cacheKey = `dataset-${params.datasetID}`;
  const capture = useErrorHandler();
  return useRequest(
    async () => {
      if (!params.datasetID) {
        throw new CustomError(
          'useListDataSetReq_error',
          'datasetid cannot be empty',
        );
      }
      const res = await KnowledgeApi.ListDataset({
        filter: {
          dataset_ids: [params.datasetID],
        },
        space_id: spaceId,
      });

      if (res?.total) {
        return res?.dataset_list?.find(i => i.dataset_id === params.datasetID);
      } else if (res?.total !== 0) {
        capture(new CustomError('useListDataSetReq_error', res.msg || ''));
      }
    },
    {
      cacheKey,
      setCache: data => sessionStorage.setItem(cacheKey, JSON.stringify(data)),
      getCache: () => JSON.parse(sessionStorage.getItem(cacheKey) || '{}'),
      onError: error => {
        Toast.error({
          content: I18n.t('Network_error'),
          showClose: false,
        });
        capture(error);
      },
    },
  );
};
