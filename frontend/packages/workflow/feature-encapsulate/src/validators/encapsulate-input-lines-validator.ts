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
import { I18n } from '@coze-arch/i18n';

import {
  EncapsulateValidateErrorCode,
  type EncapsulateNodesValidator,
} from '../validate';
import { EncapsulateLinesService } from '../encapsulate';

@injectable()
export class EncapsulateInputLinesValidator
  implements EncapsulateNodesValidator
{
  @inject(EncapsulateLinesService)
  private encapsulateLinesService: EncapsulateLinesService;

  validate(nodes, result) {
    const inputLines =
      this.encapsulateLinesService.getEncapsulateNodesInputLines(nodes);

    if (inputLines.length === 0) {
      return;
    }
    const valid =
      this.encapsulateLinesService.validateEncapsulateLines(inputLines);

    if (!valid) {
      result.addError({
        code: EncapsulateValidateErrorCode.ENCAPSULATE_LINES,
        message: I18n.t(
          'workflow_encapsulate_button_unable_connected',
          undefined,
          '框选范围内有中间节点连到框选范围外的节点',
        ),
      });
    }
  }
}
