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
import { type WorkflowJSON } from '@flowgram-adapter/free-layout-editor';

import {
  EncapsulateValidateErrorCode,
  type EncapsulateValidateError,
  type EncapsulateValidateResult,
  type EncapsulateWorkflowJSONValidator,
} from '../validate';
import { EncapsulateApiService } from '../api';
import { EncapsulateBaseValidator } from './encapsulate-base-validator';

@injectable()
export class EncapsulateSchemaValidator
  extends EncapsulateBaseValidator
  implements EncapsulateWorkflowJSONValidator
{
  @inject(EncapsulateApiService)
  private encapsulateApiService: EncapsulateApiService;

  async validate(workflow: WorkflowJSON, result: EncapsulateValidateResult) {
    const validateResult = await this.encapsulateApiService.validateWorkflow(
      workflow,
    );

    if (!validateResult?.length) {
      return;
    }

    const errors = validateResult || [];

    errors.forEach(error => {
      const nodeId = error.node_error?.node_id || error.path_error?.start || '';
      const node = this.workflowDocument.getNode(nodeId);
      let sourceName: EncapsulateValidateError['sourceName'] = undefined;
      let sourceIcon: EncapsulateValidateError['sourceIcon'] = undefined;
      let source: EncapsulateValidateError['source'] = undefined;

      if (node) {
        sourceName = this.getNodeName(node);
        sourceIcon = this.getNodeIcon(node);
        source = node.id;
      }

      result.addError({
        code: EncapsulateValidateErrorCode.INVALID_SCHEMA,
        message: error.message || '',
        source,
        sourceName,
        sourceIcon,
      });
    });
  }
}
