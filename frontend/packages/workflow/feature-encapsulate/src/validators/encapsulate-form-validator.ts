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
import { ValidationService } from '@coze-workflow/base/services';
import { StandardNodeType } from '@coze-workflow/base';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import {
  type EncapsulateNodeValidator,
  EncapsulateValidateErrorCode,
  type EncapsulateValidateResult,
} from '../validate';
import { EncapsulateBaseValidator } from './encapsulate-base-validator';

@injectable()
export class EncapsulateFormValidator
  extends EncapsulateBaseValidator
  implements EncapsulateNodeValidator
{
  @inject(ValidationService)
  private validationService: ValidationService;

  canHandle(_type: string) {
    return true;
  }

  async validate(node: WorkflowNodeEntity, result: EncapsulateValidateResult) {
    // Note nodes do not require validation
    if (
      [StandardNodeType.Comment].includes(node.flowNodeType as StandardNodeType)
    ) {
      return;
    }

    const res = await this.validationService.validateNode(node);

    if (!res.hasError) {
      return;
    }

    const sourceName = this.getNodeName(node);
    const sourceIcon = this.getNodeIcon(node);
    const errors = res.nodeErrorMap[node.id] || [];

    errors.forEach(error => {
      if (!error.errorInfo || error.errorLevel !== 'error') {
        return;
      }

      result.addError({
        code: EncapsulateValidateErrorCode.INVALID_FORM,
        message: error.errorInfo,
        source: node.id,
        sourceName,
        sourceIcon,
      });
    });
  }
}
