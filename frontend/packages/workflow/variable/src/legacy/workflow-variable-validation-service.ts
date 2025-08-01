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
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type RefExpression } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { WorkflowVariableFacadeService } from '../core';
import { WorkflowVariableService } from './workflow-variable-service';

@injectable()
export class WorkflowVariableValidationService {
  @inject(WorkflowVariableService)
  protected readonly variableService: WorkflowVariableService;

  @inject(WorkflowVariableFacadeService)
  protected readonly variableFacadeService: WorkflowVariableFacadeService;

  isRefVariableEligible(value: RefExpression, node: WorkflowNodeEntity) {
    const variable = this.variableFacadeService.getVariableFacadeByKeyPath(
      value?.content?.keyPath,
      { node },
    );

    if (!variable || !variable.canAccessByNode(node.id)) {
      return I18n.t('workflow_detail_variable_referenced_error');
    }

    return;
  }
}
