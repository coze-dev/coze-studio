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

import { type FormItemSchema } from '../../types';
import { FormItemSchemaType } from '../../constants';

/**
 * placeholder
 * - bot: Please select bot
 * - Other: xx required
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
