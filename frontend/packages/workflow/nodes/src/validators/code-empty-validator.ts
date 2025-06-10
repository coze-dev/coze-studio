import { I18n } from '@coze-arch/i18n';

export function codeEmptyValidator({ value }) {
  const code = value?.code;
  if (!code) {
    return I18n.t('workflow_running_results_error_code');
  }

  return true;
}
