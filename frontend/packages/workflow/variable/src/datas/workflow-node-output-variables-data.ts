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

import {
  ASTKind,
  FlowNodeVariableData,
  type ObjectType,
} from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { EntityData } from '@flowgram-adapter/free-layout-editor';
import { type Disposable } from '@flowgram-adapter/common';

import { type WorkflowVariable, WorkflowVariableFacadeService } from '../core';

/**
 * Represents the data for output variables of a flow node.
 */
export class WorkflowNodeOutputVariablesData extends EntityData {
  static readonly type = 'WorkflowNodeOutputVariablesData';

  declare entity: FlowNodeEntity;

  getDefaultData() {
    return {};
  }

  protected get variableData(): FlowNodeVariableData {
    return this.entity.getData(FlowNodeVariableData);
  }

  protected get facadeService() {
    return this.entity.getService(WorkflowVariableFacadeService);
  }

  protected get outputObjectType(): ObjectType | undefined {
    const output = this.variableData.public.output.variables[0];
    if (output?.type?.kind !== ASTKind.Object) {
      return undefined;
    }
    return output.type as ObjectType;
  }

  /**
   * Retrieves the list of workflow variables based on the output object type properties.
   * @returns An array of workflow variables.
   */
  get variables(): WorkflowVariable[] {
    return (this.outputObjectType?.properties || []).map(_property =>
      this.facadeService.getVariableFacadeByField(_property),
    );
  }

  /**
   * Retrieves a workflow variable by its key.
   * @param key - The key of the variable.
   * @returns The workflow variable or undefined if not found.
   */
  getVariableByKey(key: string): WorkflowVariable | undefined {
    const field = this.outputObjectType?.propertyTable.get(key);
    return field
      ? this.facadeService.getVariableFacadeByField(field)
      : undefined;
  }

  /**
   * Registers a callback function that will be invoked whenever any variable changes.
   *
   * @param cb - The callback function to be executed on any variable change.
   * @returns A `Disposable` object that can be used to unregister the callback.
   */
  onAnyVariablesChange(cb: () => void): Disposable {
    return this.variableData.public.ast.subscribe(cb);
  }
}
