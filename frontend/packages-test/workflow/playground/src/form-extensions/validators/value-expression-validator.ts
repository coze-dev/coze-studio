import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type PlaygroundContext } from '@coze-workflow/nodes';
import { ValueExpression, ValueExpressionType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

export interface ValueExpressionValidatorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  /**
   * 是否必填
   */
  required?: boolean;
  /**
   * ValueExpression 所在的node
   */
  node: WorkflowNodeEntity;
  playgroundContext: PlaygroundContext;
  emptyErrorMessage?: string;
}

export const valueExpressionValidator = ({
  value,
  playgroundContext,
  node,
  required,
  emptyErrorMessage = I18n.t('workflow_detail_node_error_empty'),
}: ValueExpressionValidatorProps) => {
  const { variableValidationService } = playgroundContext;

  // 校验空值
  if (ValueExpression.isEmpty(value)) {
    if (!required) {
      return;
    }

    return emptyErrorMessage;
  }

  if (value.type === ValueExpressionType.REF) {
    return variableValidationService.isRefVariableEligible(value, node);
  }
};
