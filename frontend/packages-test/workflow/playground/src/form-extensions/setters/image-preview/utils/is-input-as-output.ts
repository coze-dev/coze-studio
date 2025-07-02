import { StandardNodeType } from '@coze-workflow/base';
const inputAsOutputNodes = [StandardNodeType.End, StandardNodeType.Output];

export const isInputAsOutput = (flowNodeType: StandardNodeType) =>
  inputAsOutputNodes.includes(flowNodeType);
