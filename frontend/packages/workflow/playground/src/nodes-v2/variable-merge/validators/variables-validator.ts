import { I18n } from '@coze-arch/i18n';
import { type Validate } from '@flowgram-adapter/free-layout-editor';

import { MAX_GROUP_VARIABLE_COUNT } from '../constants';

export const variablesValidator: Validate = ({ value }) => {
  const { length } = value || [];
  if (length === 0) {
    return I18n.t('workflow_var_merge_var_err_noempty');
  }

  if (length > MAX_GROUP_VARIABLE_COUNT) {
    return `variables should not be more than ${MAX_GROUP_VARIABLE_COUNT}`;
  }
};
