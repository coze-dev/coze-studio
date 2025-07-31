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

import React from 'react';

import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { OutputsField } from '@/node-registries/common/fields';
import { NodeConfigForm } from '@/node-registries/common/components';
import { Section } from '@/form';

import { DatasetSelectField } from '../common/componets/dataset-select-field';
import { DatasetParamsField } from '../common/componets/dataset-params-field';
import { DatasetSettingField } from './components/dataset-setting-field';

const Render = () => (
  <NodeConfigForm>
    <DatasetParamsField
      inputFiedlName="inputs.inputParameters.Query"
      testId="/inputs/inputParameters/Query"
      tooltip={I18n.t(
        'workflow_detail_knowledge_input_tooltip',
        {},
        '输入需要从知识中匹配的关键信息',
      )}
      paramName={'Query'}
      paramType={ViewVariableType.String}
      inputType={ViewVariableType.String}
    />
    <Section
      title={I18n.t('workflow_detail_knowledge_knowledge', {}, '知识库')}
      tooltip={I18n.t(
        'workflow_detail_knowledge_knowledge_tooltip',
        {},
        '选择需要匹配的知识范围，仅从选定的知识中召回信息',
      )}
    >
      <div className="w-full mb-[16px]">
        <DatasetSelectField name="inputs.datasetParameters.datasetParam" />
      </div>
      <DatasetSettingField name="inputs.datasetParameters.datasetSetting" />
    </Section>
    <OutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('workflow_detail_knowledge_output_tooltip')}
      id={'dataset-node-output'}
      name={'outputs'}
      withDescription={false}
      jsonImport={false}
      customReadonly={true}
      disabled={true}
      allowAppendRootData={false}
      hasFeedback={false}
    />
  </NodeConfigForm>
);

export default Render;
