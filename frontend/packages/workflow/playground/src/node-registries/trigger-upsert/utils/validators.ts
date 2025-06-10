import { isUndefined } from 'lodash-es';
import { ValueExpression } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';

export const undefinedChecker = value => {
  let rs = true;
  if (isUndefined(value) || value === '') {
    rs = false;
  }

  if (
    ValueExpression.isExpression(value as ValueExpression) &&
    ValueExpression.isEmpty(value as ValueExpression)
  ) {
    rs = false;
  }

  /**
   * 校验 cronjob 的值是否为空
   * {
   *   type: 'selecting',
   *   content: ValueExpression
   * }
   */
  if (
    (
      value as {
        content: ValueExpression;
      }
    )?.content &&
    ValueExpression.isExpression(
      (
        value as {
          content: ValueExpression;
        }
      )?.content as ValueExpression,
    ) &&
    ValueExpression.isEmpty(
      (
        value as {
          content: ValueExpression;
        }
      )?.content as ValueExpression,
    )
  ) {
    rs = false;
  }
  return rs
    ? undefined
    : I18n.t('workflow_detail_node_error_empty', {}, '参数值不可为空');
};
