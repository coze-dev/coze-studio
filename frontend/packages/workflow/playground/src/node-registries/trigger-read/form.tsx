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

import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { NodeConfigForm } from '@/node-registries/common/components';
import { Field, Section } from '@/form';

import { FixedInputParameter } from '../trigger-upsert/components/fixed-input-parameter-field';
import { OutputsField } from '../common/fields';
import { INPUT_PATH } from './constants';

export const FormRender = () => (
  <NodeConfigForm>
    <Section title={I18n.t('workflow_detail_node_input', {}, '输入')}>
      <Field name={INPUT_PATH}>
        <div className="flex flex-col gap-[8px]">
          <FixedInputParameter
            layout="horizontal"
            name={INPUT_PATH}
            fieldConfig={[
              {
                description: '',
                name: 'triggerId',
                label: I18n.t('workflow_trigger_user_create_id', {}, 'id'),
                required: false,
                type: ViewVariableType.String,
              },
              {
                label: I18n.t(
                  'workflow_trigger_user_create_userid',
                  {},
                  'userId',
                ),
                description: I18n.t(
                  'workflow_trigger_user_create_userid_tooltips',
                  {},
                  '用于设置触发器所属用户，可以使用变量-系统变量中的sys_uuid来唯一标识用户',
                ),
                name: 'userId',
                required: true,
                type: ViewVariableType.String,
              },
            ]}
          />
        </div>
      </Field>
    </Section>
    <OutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('node_http_response_data')}
      id="triggerDelete-node-outputs"
      name="outputs"
      topLevelReadonly={true}
      customReadonly
    />
  </NodeConfigForm>
);
