import { useRequest } from 'ahooks';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { KnowledgeApi } from '@coze-arch/bot-api';

export const useInit = (datasetId: string) => {
  const { data: initAccountList, loading: initLoading } = useRequest(
    async () => {
      const response = await KnowledgeApi.GetAppendFrequency({
        dataset_id: datasetId,
      });
      return response.auth_frequency_info;
    },
    {
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeGetAuthList,
          error,
        });
      },
    },
  );

  return {
    initAccountList,
    initLoading,
  };
};
