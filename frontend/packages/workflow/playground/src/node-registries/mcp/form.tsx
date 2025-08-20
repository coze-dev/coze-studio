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

import { OutputsField, InputsParametersField } from '../common/fields';
import { INPUT_PATH } from './constants';

export const FormRender = () => (
  <NodeConfigForm>
    <InputsParametersField
      name={INPUT_PATH}
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- 
         defaultValue需要any类型以匹配InputsParametersField的类型定义 */
      defaultValue={[{ name: 'tool_name' }, { name: 'parameters' }] as any}
      title={I18n.t('MCP工具配置')}
      tooltip={I18n.t('配置MCP工具的参数和设置')}
      required={false}
      layout="horizontal"
    />

    <OutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('MCP工具执行结果')}
      id="mcp-node-outputs"
      name="outputs"
      topLevelReadonly={true}
      customReadonly
    />
  </NodeConfigForm>
);
