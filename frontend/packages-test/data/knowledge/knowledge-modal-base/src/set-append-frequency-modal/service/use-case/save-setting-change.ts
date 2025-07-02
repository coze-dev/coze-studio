import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { type AuthFrequencyInfo } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';

export const saveSettingChange = async (params: {
  datasetId: string;
  pendingAccounts: AuthFrequencyInfo[];
}) => {
  const { datasetId, pendingAccounts } = params;

  try {
    await KnowledgeApi.SetAppendFrequency({
      dataset_id: datasetId,
      auth_frequency_info: pendingAccounts.map(account => ({
        auth_id: account.auth_id,
        auth_frequency_type: account.auth_frequency_type,
      })),
    });
  } catch (error) {
    dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
      eventName: REPORT_EVENTS.KnowledgeUpdateWechatFrequency,
      error: error as Error,
    });
    throw error;
  }
};
