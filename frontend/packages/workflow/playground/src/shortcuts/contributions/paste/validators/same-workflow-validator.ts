import {
  BaseNodeValidator,
  type NodeValidationContext,
} from './base-validator';

export class SameWorkflowValidator extends BaseNodeValidator {
  protected validate(context: NodeValidationContext): boolean | null {
    const { source, globalState } = context;
    return source.workflowId === globalState.workflowId ? true : null;
  }
}
