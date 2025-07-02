import type { FormItemMaterialContext } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowNode,
  type InputValueVO,
  getFormValueByPathEnds,
} from '@coze-workflow/base';

export const getLoopInputNames = (
  context: FormItemMaterialContext,
): string[] => {
  const workflowNode = new WorkflowNode(context.node);
  const loopInputParameters: InputValueVO[] =
    workflowNode?.inputParameters ?? [];
  const loopVariables: InputValueVO[] =
    getFormValueByPathEnds<InputValueVO[]>(
      context.node,
      '/variableParameters',
    ) ?? [];
  const loopInputs = [...loopInputParameters, ...loopVariables];
  return loopInputs.map(input => input.name).filter(Boolean) as string[];
};
