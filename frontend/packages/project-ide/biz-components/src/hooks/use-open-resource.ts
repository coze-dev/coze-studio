import { useIDENavigate } from '@coze-project-ide/framework';

import { type BizResourceTypeEnum } from '@/resource-folder-coze/type';

export const useOpenResource = () => {
  const navigate = useIDENavigate();
  return ({
    resourceId,
    resourceType,
  }: {
    resourceType?: BizResourceTypeEnum;
    resourceId?: string;
  }) => navigate(`/${resourceType}/${resourceId}`);
};
