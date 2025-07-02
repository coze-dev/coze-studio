import { type Model } from '@coze-arch/bot-api/developer_api';

export const getModelOptionList = ({
  onlineModelList,
  offlineModelMap,
  currentModelId,
}: {
  onlineModelList: Model[];
  offlineModelMap: Record<string, Model>;
  currentModelId: string | undefined;
}) => {
  if (!currentModelId) {
    return onlineModelList;
  }
  const specialModel = offlineModelMap[currentModelId];
  if (!specialModel) {
    return onlineModelList;
  }
  return onlineModelList.concat([specialModel]);
};
