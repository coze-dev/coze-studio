import { type Model } from '@coze-arch/bot-api/developer_api';

export const getModelById = ({
  onlineModelList,
  offlineModelMap,
  id,
}: {
  onlineModelList: Model[];
  offlineModelMap: Record<string, Model>;
  id: string;
}) => {
  if (!id) {
    return;
  }
  const expectSpecialModel = offlineModelMap[id];
  if (expectSpecialModel) {
    return expectSpecialModel;
  }
  return onlineModelList.find(model => String(model.model_type) === id);
};
