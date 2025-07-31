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

import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { type IFormSchema } from '@coze-workflow/test-run-next';
import { I18n } from '@coze-arch/i18n';

import { generateParametersToProperties } from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  generateFormInputProperties(node) {
    const labelMap = {
      triggerName: I18n.t('workflow_trigger_user_create_name'),
      triggerId: I18n.t('workflow_trigger_user_create_id'),
      userId: I18n.t('workflow_trigger_user_create_userid'),
    };
    const requiredKeys = ['triggerName', 'userId'];
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const fixedInputs = formData?.inputs?.fixedInputs;
    const configProperties = generateParametersToProperties(
      Object.entries(fixedInputs || {}).map(([key, value]) => ({
        name: `__trigger_config_${key}`,
        title: labelMap[key] || key,
        required: requiredKeys.includes(key),
        input: value,
      })),
      { node },
    );
    const crontab = formData?.inputs?.dynamicInputs?.crontab;

    let crontabProperties: IFormSchema = {};
    if (crontab?.type === 'cronjob') {
      crontabProperties = generateParametersToProperties(
        [
          {
            name: '__trigger_config_crontab',
            title: I18n.t('workflow_trigger_user_create_schedula'),
            required: true,
            input: crontab?.content,
          },
        ],
        { node },
      );
    }
    const payload = formData?.inputs?.payload;
    const payloadProperties = generateParametersToProperties(
      Object.entries(payload || {}).map(([key, value]) => {
        const parameterKey = key?.split(',')[1] || key;
        return {
          name: `__trigger_payload_${parameterKey}`,
          title: parameterKey,
          input: value,
        };
      }),
      { node },
    );
    return {
      ...configProperties,
      ...crontabProperties,
      ...payloadProperties,
    };
  },
};
