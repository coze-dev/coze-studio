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
import { useForm } from '@flowgram-adapter/free-layout-editor';

import { NodeConfigForm } from '@/node-registries/common/components';

import { OutputsField, InputsParametersField } from '../common/fields';
import { CODE_PATH, INPUT_PATH, OUTPUT_PATH } from './constants';
import { CodeField } from './components';

export const FormRender = () => {
  const form = useForm();
  return (
    <NodeConfigForm>
      <InputsParametersField
        name={INPUT_PATH}
        tooltip={I18n.t('workflow_detail_code_input_tooltip')}
        isTree={true}
      />

      <CodeField
        name={CODE_PATH}
        tooltip={I18n.t('workflow_detail_code_code_tooltip')}
        inputParams={form.getValueIn(INPUT_PATH)}
        outputParams={form.getValueIn(OUTPUT_PATH)}
        hasFeedback={false}
      />

      <OutputsField
        title={I18n.t('workflow_detail_node_output')}
        tooltip={I18n.t('workflow_detail_code_output_tooltip')}
        jsonImport={false}
        id="code-node-outputs"
        name={OUTPUT_PATH}
        hasFeedback={false}
      />
    </NodeConfigForm>
  );
};
