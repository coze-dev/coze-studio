import { type RecallStrategy } from '@coze-arch/bot-api/playground_api';

import { type IDataSetInfo } from './type';

export const recallStrategyUpdater: (params: {
  datasetInfo: IDataSetInfo;
  field: keyof RecallStrategy;
  value: boolean;
}) => IDataSetInfo = ({ datasetInfo, field, value }) => {
  if (!datasetInfo.recall_strategy) {
    datasetInfo.recall_strategy = {
      [field]: value,
    };
  } else {
    datasetInfo.recall_strategy[field] = value;
  }
  return datasetInfo;
};
