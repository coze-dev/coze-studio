import { ViewVariableType } from '@coze-workflow/base';

import type { TreeNodeCustomData } from '../../custom-tree-node/type';

export const addBatchData = (params: {
  data: TreeNodeCustomData[];
  isBatch: boolean;
}): TreeNodeCustomData[] => {
  const { data, isBatch } = params;
  if (!isBatch) {
    return data;
  }
  return [
    {
      name: 'outputList',
      type: ViewVariableType.ArrayObject,
      children: data,
    },
  ] as TreeNodeCustomData[];
};
