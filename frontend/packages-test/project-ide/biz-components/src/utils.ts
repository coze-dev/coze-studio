import { ResType } from '@coze-arch/bot-api/plugin_develop';

import { BizResourceTypeEnum } from '@/resource-folder-coze/type';

export const resTypeDTOToVO = (
  resType?: ResType,
): BizResourceTypeEnum | undefined => {
  if (!resType) {
    return;
  }
  switch (resType) {
    case ResType.Imageflow:
    case ResType.Workflow:
      return BizResourceTypeEnum.Workflow;
    case ResType.Knowledge:
      return BizResourceTypeEnum.Knowledge;
    case ResType.Plugin:
      return BizResourceTypeEnum.Plugin;
    case ResType.Variable:
      return BizResourceTypeEnum.Variable;
    case ResType.Database:
      return BizResourceTypeEnum.Database;
    default:
      return BizResourceTypeEnum.Workflow;
  }
};
