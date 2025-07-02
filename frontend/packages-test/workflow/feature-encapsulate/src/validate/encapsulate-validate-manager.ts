import { injectable, multiInject, optional } from 'inversify';
import { type StandardNodeType } from '@coze-workflow/base/types';

import {
  EncapsulateNodeValidator,
  type EncapsulateValidateManager,
  EncapsulateNodesValidator,
  EncapsulateWorkflowJSONValidator,
} from './types';

@injectable()
export class EncapsulateValidateManagerImpl
  implements EncapsulateValidateManager
{
  @multiInject(EncapsulateNodesValidator)
  @optional()
  private nodesValidators: EncapsulateNodesValidator[] = [];

  @multiInject(EncapsulateNodeValidator)
  @optional()
  private nodeValidators: EncapsulateNodeValidator[] = [];

  @multiInject(EncapsulateWorkflowJSONValidator)
  @optional()
  private workflowJSONValidators: EncapsulateWorkflowJSONValidator[] = [];

  getNodeValidators() {
    return this.nodeValidators || [];
  }

  getNodesValidators() {
    return this.nodesValidators || [];
  }

  getWorkflowJSONValidators() {
    return this.workflowJSONValidators || [];
  }

  getNodeValidatorsByType(type: StandardNodeType) {
    return (this.nodeValidators || []).filter(validator =>
      validator.canHandle(type),
    );
  }

  dispose() {
    this.nodeValidators = [];
    this.nodesValidators = [];
    this.workflowJSONValidators = [];
  }
}
