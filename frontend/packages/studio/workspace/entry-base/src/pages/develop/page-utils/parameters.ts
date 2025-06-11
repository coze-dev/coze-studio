import { IntelligenceType } from '@coze-arch/idl/intelligence_api';

import { DevelopCustomPublishStatus, DevelopCustomTypeStatus } from '../type';

export const getPublishRequestParam = (
  publishStatus: DevelopCustomPublishStatus | undefined,
) => {
  if (typeof publishStatus === 'undefined') {
    return;
  }
  if (publishStatus === DevelopCustomPublishStatus.All) {
    return;
  }
  return publishStatus === DevelopCustomPublishStatus.Publish;
};

/**
 * 项目类型请求前后端参数映射，将DevelopCustomTypeStatus映射为IntelligenceType[]
 * 需要根据是否可以展示抖音分身来决定是否处理 DouyinAvatarBot
 * @param type
 * @returns
 */
export const getTypeRequestParams = ({
  type,
}: {
  type: DevelopCustomTypeStatus;
}) => {
  const allIntelligenceTypeParams = [
    IntelligenceType.Bot,
    IntelligenceType.Project,
  ];
  const typeMap: Record<DevelopCustomTypeStatus, IntelligenceType[]> = {
    [DevelopCustomTypeStatus.All]: allIntelligenceTypeParams,
    [DevelopCustomTypeStatus.Agent]: [IntelligenceType.Bot],
    [DevelopCustomTypeStatus.Project]: [IntelligenceType.Project],
    [DevelopCustomTypeStatus.DouyinAvatarBot]: [
      IntelligenceType.DouyinAvatarBot,
    ],
  };

  return typeMap[type] || [];
};
