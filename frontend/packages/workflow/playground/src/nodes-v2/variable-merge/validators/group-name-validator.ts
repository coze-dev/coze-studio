/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  /** naming rule validation */
  if (!nameValidationRule.test(name)) {
    return I18n.t('workflow_detail_node_error_format');
  }

  if (name.length > MAX_GROUP_NAME_COUNT) {
    return I18n.t('workflow_var_merge_name_lengthmax');
  }

  // duplicate name verification
  if (names.filter(item => item === name).length > 1) {
    return I18n.t('workflow_var_merge_output_namedul');
  }
}
