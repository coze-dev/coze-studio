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
import { I18n } from '@coze-arch/i18n';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { getSubCanvasParent, isSubCanvasNode } from '@/utils/subcanvas';

import {
  type EncapsulateNodesValidator,
  EncapsulateValidateErrorCode,
  type EncapsulateValidateResult,
} from '../validate';
import { EncapsulateBaseValidator } from './encapsulate-base-validator';

@injectable()
export class SubCanvasValidator
  extends EncapsulateBaseValidator
  implements EncapsulateNodesValidator
{
  validate(nodes: WorkflowNodeEntity[], result: EncapsulateValidateResult) {
    nodes
      .filter(node => isSubCanvasNode(node))
      .forEach(subCanvasNode => {
        const parent = getSubCanvasParent(subCanvasNode);
        if (!parent) {
          return;
        }

        const sourceName = this.getNodeName(subCanvasNode);
        const sourceIcon = this.getNodeIcon(subCanvasNode);
        if (!nodes.includes(parent)) {
          result.addError({
            code: EncapsulateValidateErrorCode.INVALID_SUB_CANVAS,
            message: I18n.t('workflow_encapsulate_button_unable_loop_or_batch'),
            source: subCanvasNode.id,
            sourceName,
            sourceIcon,
          });
        }
      });
  }
}
