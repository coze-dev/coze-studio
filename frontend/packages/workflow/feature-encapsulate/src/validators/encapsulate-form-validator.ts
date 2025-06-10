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
    // 注释节点不需要校验
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
