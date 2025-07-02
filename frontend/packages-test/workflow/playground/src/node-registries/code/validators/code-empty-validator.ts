import { I18n } from '@coze-arch/i18n';
import { type Validate } from '@flowgram-adapter/free-layout-editor';

export const codeEmptyValidator: Validate = ({ value }) => {
  const code = value?.code;
  if (!code) {
    return I18n.t('workflow_running_results_error_code');
  }
};
