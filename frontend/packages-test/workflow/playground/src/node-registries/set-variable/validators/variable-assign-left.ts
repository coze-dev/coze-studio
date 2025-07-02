/* eslint-disable  @typescript-eslint/naming-convention*/
import { type Validate } from '@flowgram-adapter/free-layout-editor';
import type { RefExpression } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { valueExpressionValidator } from '@/form-extensions/validators';

import { getLeftRightVariable } from '../utils';

export const VariableAssignLeftValidator: Validate<RefExpression> = (params => {
  const { context, value, name } = params;
  const { playgroundContext, node } = context;
  const valueExpressionValid = valueExpressionValidator({
    value,
    playgroundContext,
    node,
    required: true,
  });

  if (valueExpressionValid) {
    return valueExpressionValid;
  }

  const { left, right, leftPath, rightPath, leftType, rightType } =
    getLeftRightVariable({
      node,
      name,
      playgroundContext,
    });

  if (!left) {
    return I18n.t('workflow_detail_node_error_empty');
  }

  if (right && leftType !== rightType) {
    return I18n.t('workflow_loop_set_variable_typewrong');
  }

  if (leftPath && rightPath && leftPath.join('.') === rightPath.join('.')) {
    return I18n.t('workflow_loop_set_variable_samewrong');
  }

  return true;
}) as Validate<RefExpression>;
