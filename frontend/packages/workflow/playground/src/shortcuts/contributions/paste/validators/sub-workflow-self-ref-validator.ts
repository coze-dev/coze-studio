import { StandardNodeType } from '@coze-workflow/base';

import {
  BaseNodeValidator,
  type NodeValidationContext,
} from './base-validator';

export class SubWorkflowSelfRefValidator extends BaseNodeValidator {
  protected validate(context: NodeValidationContext): boolean | null {
    const { node, globalState } = context;

    // 不允许工作流引用自己作为子工作流
    if (
      node.type === StandardNodeType.SubWorkflow &&
      node.data?.inputs?.workflowId === globalState.workflowId
    ) {
      return false;
    }

    return null;
  }
}
