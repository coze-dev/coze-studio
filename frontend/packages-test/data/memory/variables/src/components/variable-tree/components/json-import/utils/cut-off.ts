import { type Variable, ViewVariableType } from '@/store';

import {
  traverse,
  type TraverseContext,
  type TraverseHandler,
} from './traverse';

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

export const cutOffInvalidData = (params: {
  data: Variable[];
  allowDepth: number;
  allowNameLength: number;
  maxVariableCount: number;
}): Variable[] => {
  const { data, allowDepth, allowNameLength, maxVariableCount } = params;
  const cutOffVariableCountData = data.slice(0, maxVariableCount);
  return traverse<Variable[]>(cutOffVariableCountData, [
    cutOffNameLength(allowNameLength),
    cutOffDepth(allowDepth),
  ]);
};
