import { get } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { type Validate } from '@flowgram-adapter/free-layout-editor';

import { nameValidationRule } from '@/nodes-v2/components/helpers';

import { MAX_GROUP_NAME_COUNT } from '../constants';

export const groupNameValidator: Validate = ({ value, formValues }) => {
  const names = (get(formValues, 'inputs.mergeGroups') || []).map(
    item => item.name,
  );

  return validateGroupName(value, names);
};

export function validateGroupName(name: string, names: string[]) {
  /** 命名规则校验 */
  if (!nameValidationRule.test(name)) {
    return I18n.t('workflow_detail_node_error_format');
  }

  if (name.length > MAX_GROUP_NAME_COUNT) {
    return I18n.t('workflow_var_merge_name_lengthmax');
  }

  // 重复名字校验
  if (names.filter(item => item === name).length > 1) {
    return I18n.t('workflow_var_merge_output_namedul');
  }
}
