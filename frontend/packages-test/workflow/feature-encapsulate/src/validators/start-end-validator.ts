import { injectable } from 'inversify';
import { StandardNodeType } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';

import {
  EncapsulateValidateErrorCode,
  type EncapsulateNodesValidator,
} from '../validate';

@injectable()
export class StartEndValidator implements EncapsulateNodesValidator {
  validate(nodes, result) {
    const filtered = nodes.filter(node =>
      [StandardNodeType.Start, StandardNodeType.End].includes(
        node.flowNodeType,
      ),
    );

    if (filtered.length) {
      result.addError({
        code: EncapsulateValidateErrorCode.NO_START_END,
        message: I18n.t(
          'workflow_encapsulate_button_unable_start_or_end',
          undefined,
          '框选范围内包含开始/结束',
        ),
      });
    }
  }

  includeStartEnd = true;
}
