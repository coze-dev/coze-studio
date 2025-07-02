import { I18n } from '@coze-arch/i18n';

import { ValueExpressionService } from '@/services';

export function createSelectAndSetFieldsValidator() {
  return {
    ['inputs.*.fieldInfo.*.fieldValue']: ({ value, context }) => {
      const valueExpressionService = context.node.getService(
        ValueExpressionService,
      );

      // 检查引用变量是否被删除
      if (
        valueExpressionService.isRefExpression(value) &&
        !valueExpressionService.isRefExpressionVariableExists(
          value,
          context.node,
        )
      ) {
        return I18n.t('workflow_detail_variable_referenced_error');
      }
    },
  };
}
