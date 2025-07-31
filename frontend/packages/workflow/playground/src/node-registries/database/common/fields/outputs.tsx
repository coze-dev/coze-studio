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

import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { OutputsField as BaseOutputsField } from '@/node-registries/common/fields/outputs';
import { type FieldProps } from '@/form';

export function OutputsField({
  name,
  deps,
}: Pick<FieldProps, 'name' | 'deps'>) {
  return (
    <BaseOutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('workflow_240218_08')}
      id="database-node-outputs"
      name={name}
      deps={deps}
      topLevelReadonly={true}
      disabledTypes={[ViewVariableType.Object]}
      defaultValue={[
        {
          key: nanoid(),
          name: 'outputList',
          type: ViewVariableType.ArrayObject,
        },
        {
          key: nanoid(),
          name: 'rowNum',
          type: ViewVariableType.Integer,
        },
      ]}
    />
  );
}
