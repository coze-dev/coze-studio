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
