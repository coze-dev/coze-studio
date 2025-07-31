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
import { type InputValueVO, ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { NodeConfigForm } from '@/node-registries/common/components';
import { Section } from '@/form';

import { InputsParametersField, OutputsField } from '../common/fields';
import { INPUT_PATH } from './constants';
import { Canvas } from './components';

export const FormRender = () => (
  <NodeConfigForm>
    <InputsParametersField
      name={INPUT_PATH}
      title={I18n.t('imageflow_canvas_element_set')}
      tooltip={I18n.t('imageflow_canvas_elment_tooltip')}
      paramsTitle={I18n.t('imageflow_canvas_element_name')}
      expressionTitle={I18n.t('imageflow_canvas_element_desc')}
      defaultValue={[]}
      onAppend={() =>
        ({
          id: nanoid(),
        } as unknown as InputValueVO)
      }
      disabledTypes={ViewVariableType.getComplement([
        ViewVariableType.String,
        ViewVariableType.Image,
      ])}
      // inputPlaceholder={inputPlaceholder}
      literalDisabled={true}
    />

    <Section
      title={I18n.t('imageflow_canvas_edit')}
      tooltip={I18n.t('imageflow_canvas_desc')}
    >
      <Canvas name="inputs.canvasSchema" />
    </Section>
    <OutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('node_http_response_data')}
      id="imageCanvas-node-outputs"
      name="outputs"
      topLevelReadonly={true}
      customReadonly
    />
  </NodeConfigForm>
);
