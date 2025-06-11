import { I18n } from '@coze-arch/i18n';

export const SystemError = ({ errorInfo }) => (
  <div>
    <div>{I18n.t('workflow_running_results_error_sys')}</div>
    <div className="text-[--semi-color-danger] break-words">{errorInfo}</div>
  </div>
);
