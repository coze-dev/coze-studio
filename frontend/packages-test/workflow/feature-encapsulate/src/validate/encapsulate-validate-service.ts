import { inject, injectable } from 'inversify';
import { type StandardNodeType } from '@coze-workflow/base/types';
import {
  type WorkflowJSON,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

import { excludeStartEnd } from '../utils/exclude-start-end';
import { EncapsulateGenerateService } from '../generate';
import {
  EncapsulateValidateManager,
  type EncapsulateValidateService,
  type EncapsulateValidateResult,
  EncapsulateValidateResultFactory,
} from './types';

@injectable()
export class EncapsulateValidateServiceImpl
  implements EncapsulateValidateService
{
  @inject(EncapsulateValidateManager)
  private encapsulateValidateManager: EncapsulateValidateManager;

  @inject(EncapsulateValidateResultFactory)
  private encapsulateValidateResultFactory: EncapsulateValidateResultFactory;

  @inject(EncapsulateGenerateService)
  private encapsulateGenerateService: EncapsulateGenerateService;

  async validate(nodes: WorkflowNodeEntity[]) {
    const validateResult: EncapsulateValidateResult =
      this.encapsulateValidateResultFactory();
    this.validateNodes(nodes, validateResult);

    for (const node of nodes) {
      await this.validateNode(node, validateResult);
    }

    if (validateResult.hasError()) {
      return validateResult;
    }

    const workflowJSON =
      await this.encapsulateGenerateService.generateWorkflowJSON(
        excludeStartEnd(nodes),
      );

    await this.validateWorkflowJSON(workflowJSON, validateResult);
    return validateResult;
  }

  private async validateWorkflowJSON(
    workflowJSON: WorkflowJSON,
    validateResult: EncapsulateValidateResult,
  ) {
    const workflowJSONValidators =
      this.encapsulateValidateManager.getWorkflowJSONValidators();

    await Promise.all(
      workflowJSONValidators.map(workflowJSONValidator =>
        workflowJSONValidator.validate(workflowJSON, validateResult),
      ),
    );
  }

  private validateNodes(
    nodes: WorkflowNodeEntity[],
    validateResult: EncapsulateValidateResult,
  ) {
    const nodesValidators =
      this.encapsulateValidateManager.getNodesValidators();

    for (const nodesValidator of nodesValidators) {
      // 如果节点校验器需要包含起始节点和结束节点，则直接校验
      // 否则需要排除起始节点和结束节点
      nodesValidator.validate(
        nodesValidator.includeStartEnd ? nodes : excludeStartEnd(nodes),
        validateResult,
      );
    }
  }

  private async validateNode(
    node: WorkflowNodeEntity,
    validateResult: EncapsulateValidateResult,
  ) {
    const nodeValidators =
      this.encapsulateValidateManager.getNodeValidatorsByType(
        node.flowNodeType as StandardNodeType,
      );

    for (const nodeValidator of nodeValidators) {
      await nodeValidator.validate(node, validateResult);
    }
  }
}
