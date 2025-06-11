import { inject, injectable } from 'inversify';
import { I18n } from '@coze-arch/i18n';

import {
  EncapsulateValidateErrorCode,
  type EncapsulateNodesValidator,
} from '../validate';
import { EncapsulateLinesService } from '../encapsulate';

@injectable()
export class EncapsulateOutputLinesValidator
  implements EncapsulateNodesValidator
{
  @inject(EncapsulateLinesService)
  private encapsulateLinesService: EncapsulateLinesService;

  validate(nodes, result) {
    const outputLines =
      this.encapsulateLinesService.getEncapsulateNodesOutputLines(nodes);

    if (outputLines.length === 0) {
      return;
    }

    const valid =
      this.encapsulateLinesService.validateEncapsulateLines(outputLines);

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
