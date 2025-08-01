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
