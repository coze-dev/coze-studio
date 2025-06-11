import { ViewVariableType } from '@coze-workflow/base';
import {
  traverse,
  type TraverseContext,
  type TraverseHandler,
} from '@coze-workflow/base';

import type { TreeNodeCustomData } from '../../custom-tree-node/type';

const isOutputValueContext = (context: TraverseContext): boolean => {
  if (
    typeof context.node.value !== 'object' ||
    typeof context.node.value.type === 'undefined'
  ) {
    return false;
  } else {
    return true;
  }
};

const cutOffNameLength =
  (length: number): TraverseHandler =>
  (context: TraverseContext): void => {
    if (!isOutputValueContext(context)) {
      return;
    }
    if (context.node.value.name.length > length) {
      context.node.value.name = context.node.value.name.slice(0, length);
    }
  };

const cutOffDepth =
  (depth: number): TraverseHandler =>
  (context: TraverseContext): void => {
    if (
      !isOutputValueContext(context) ||
      context.node.value.level !== depth ||
      ![ViewVariableType.Object, ViewVariableType.ArrayObject].includes(
        context.node.value.type,
      )
    ) {
      return;
    }
    context.deleteSelf();
  };

const cutOffDisabledTypes =
  (params: { disabledTypes: ViewVariableType[]; isBatch: boolean }) =>
  (context: TraverseContext): void => {
    const { disabledTypes, isBatch } = params;
    if (
      !isOutputValueContext(context) ||
      !disabledTypes.includes(context.node.value.type)
    ) {
      return;
    }
    if (isBatch && context.node.value.level === 0) {
      return;
    }
    context.deleteSelf();
  };

export const cutOffInvalidData = (params: {
  data: TreeNodeCustomData[];
  isBatch: boolean;
  disabledTypes: ViewVariableType[];
  allowDepth: number;
  allowNameLength: number;
}): TreeNodeCustomData[] => {
  const { data, isBatch, disabledTypes, allowDepth, allowNameLength } = params;
  const cutOffDisabledTypesHandler = cutOffDisabledTypes({
    disabledTypes,
    isBatch,
  });
  return traverse<TreeNodeCustomData[]>(data, [
    cutOffNameLength(allowNameLength),
    cutOffDepth(allowDepth),
    cutOffDisabledTypesHandler,
  ]);
};
