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

import { injectable } from 'inversify';
import { StandardNodeType } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';

import {
  EncapsulateValidateErrorCode,
  type EncapsulateNodesValidator,
} from '../validate';

@injectable()
export class LoopNodesValidator implements EncapsulateNodesValidator {
  validate(nodes, result) {
    const filtered = nodes.filter(node =>
      [StandardNodeType.Break, StandardNodeType.Continue].includes(
        node.flowNodeType,
      ),
    );

    if (filtered.length) {
      result.addError({
        code: EncapsulateValidateErrorCode.INVALID_LOOP_NODES,
        message: I18n.t(
          'workflow_encapsulate_button_unable_continue_or_teiminate',
          undefined,
          '框选范围内包含继续循环/终止循环',
        ),
      });
    }
  }
}
