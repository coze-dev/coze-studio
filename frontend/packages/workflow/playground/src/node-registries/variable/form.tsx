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

import { NodeConfigForm } from '@/node-registries/common/components';
import { useWatch } from '@/form';

import {
  InputsParametersField,
  OutputsField,
  RadioSetterField,
} from '../common/fields';
import { ModeValue } from './constants';

const Render = () => {
  const mode = useWatch('mode');
  const isSetMode = mode === ModeValue.Set;

  return (
    <NodeConfigForm nodeDisabled readonlyAllowDeleteOperation>
      <RadioSetterField
        name="mode"
        defaultValue={ModeValue.Set}
        options={{
          key: 'mode',
          mode: 'button',
          options: [
            {
              value: ModeValue.Set,
              label: I18n.t(
                'workflow_detail_variable_set_title',
                {},
                '设置变量值',
              ),
            },
            {
              value: ModeValue.Get,
              label: I18n.t(
                'workflow_detail_variable_get_title',
                {},
                '获取变量值',
              ),
            },
          ],
        }}
        customReadonly
      />
      <InputsParametersField
        name="inputParameters"
        tooltip={I18n.t(
          'workflow_detail_variable_subtitle',
          {},
          '用于在智能体中读取和写入变量，变量名必须与智能体中的变量名匹配。',
        )}
        nameProps={{ isPureText: !isSetMode, readonly: true }}
        customReadonly
      />
      <OutputsField
        title={I18n.t('workflow_detail_node_output')}
        tooltip={I18n.t('workflow_detail_variable_set_output_tooltip')}
        id="variable-node-outputs"
        name="outputs"
        topLevelReadonly={true}
        customReadonly={isSetMode}
      />
    </NodeConfigForm>
  );
};

export default Render;
