/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
      // If the node validator needs to include a start node and an end node, it is directly validated
      // Otherwise, the start and end nodes need to be excluded.
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
