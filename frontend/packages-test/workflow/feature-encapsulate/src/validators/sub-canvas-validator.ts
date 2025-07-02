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
