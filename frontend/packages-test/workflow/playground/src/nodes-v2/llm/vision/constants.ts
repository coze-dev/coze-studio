import { type ValueExpression, ValueExpressionType } from '@coze-workflow/base';

export const DEFUALT_VISION_INPUT: ValueExpression = {
  type: ValueExpressionType.REF,
  rawMeta: { isVision: true },
};
