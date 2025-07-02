import { ConditionLogic } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

export const logicTextMap = new Map<number, string>([
  [ConditionLogic.OR, I18n.t('workflow_detail_condition_or')],
  [ConditionLogic.AND, I18n.t('workflow_detail_condition_and')],
]);
