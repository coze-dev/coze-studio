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

import { NodeConfigForm } from '@/node-registries/common/components';
import { Section } from '@/form';

import { DatasetSelectField } from '../common/componets/dataset-select-field';
import { DatasetParamsField } from '../common/componets/dataset-params-field';
import { OutputsField } from '../../common/fields';
import { DatasetWriteSetting } from './components/dataset-write-setting';

const FormRender = () => (
  <NodeConfigForm>
    <DatasetParamsField
      inputFiedlName="inputs.inputParameters.knowledge"
      testId="/inputs/inputParameters/knowledge"
      tooltip={I18n.t(
        'knowledge_write_tips_doc',
        {},
        '需要写入知识库的文档，必须满足 File-Doc 类型',
      )}
      paramName={'knowledge'}
      paramType={ViewVariableType.Doc}
      inputType={ViewVariableType.File}
      availableFileTypes={[ViewVariableType.Doc, ViewVariableType.Txt]}
      disabledTypes={ViewVariableType.getComplement([
        ViewVariableType.Doc,
        ViewVariableType.Txt,
      ])}
    />
    <Section
      title={I18n.t('workflow_detail_knowledge_knowledge')}
      tooltip={I18n.t('knowledge_writing_101')}
    >
      <DatasetSelectField name="inputs.datasetParameters.datasetParam" />
    </Section>
    <DatasetWriteSetting />

    <OutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('workflow_detail_knowledge_output_tooltip')}
      id={'dataset-write-node-output'}
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

export default FormRender;
