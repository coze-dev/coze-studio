import { I18n } from '@coze-arch/i18n';

import { type FormItemSchema } from '../../types';
import { FormItemSchemaType } from '../../constants';

/**
 * placeholder
 * - bot：请选择bot
 * - 其他：xx必填
 */
export function getTestsetFormItemPlaceholder({ name, type }: FormItemSchema) {
  if (type === FormItemSchemaType.BOT) {
    return I18n.t('workflow_testset_vardatabase_placeholder');
  } else if (type === FormItemSchemaType.BOOLEAN) {
    return I18n.t('workflow_testset_please_select');
  } else if (type === FormItemSchemaType.CHAT) {
    return I18n.t('wf_chatflow_74');
  }

  return I18n.t('workflow_detail_title_testrun_error_input', {
    a: name || '',
  });
}
