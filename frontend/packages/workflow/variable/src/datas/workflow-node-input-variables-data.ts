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

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { EntityData } from '@flowgram-adapter/free-layout-editor';
import {
  getFormValueByPathEnds,
  type RefExpressionContent,
  type InputValueVO,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { type WorkflowVariable, WorkflowVariableFacadeService } from '../core';

interface InputVariable {
  name?: string;
  refVariable?: WorkflowVariable;
}

/**
 * Represents the data for ref variables of a flow node.
 */
export class WorkflowNodeInputVariablesData extends EntityData {
  static readonly type = 'WorkflowNodeInputVariablesData';

  declare entity: FlowNodeEntity;

  getDefaultData() {
    return {};
  }

  protected get facadeService() {
    return this.entity.getService(WorkflowVariableFacadeService);
  }

  /**
   * Get the entered form value
   */
  get inputParameters(): InputValueVO[] {
    const registry = this.entity.getNodeRegister() as WorkflowNodeRegistry;

    if (registry.getNodeInputParameters) {
      return registry.getNodeInputParameters(this.entity) || [];
    } else {
      return (
        getFormValueByPathEnds<InputValueVO[]>(
          this.entity,
          '/inputParameters',
        ) || []
      );
    }
  }

  /**
   * Get all input variables, including variable names and referenced variable instances
   */

  get inputVariables(): InputVariable[] {
    return this.inputParameters.map(_input => {
      const { name } = _input;

      const refVariable = this.facadeService.getVariableFacadeByKeyPath(
        (_input.input?.content as RefExpressionContent)?.keyPath,
        { node: this.entity, checkScope: true },
      );

      return {
        name,
        refVariable,
      };
    });
  }
}
