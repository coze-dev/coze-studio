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
