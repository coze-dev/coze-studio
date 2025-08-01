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

import { get } from 'lodash-es';
import {
  ValidateTrigger,
  type FormMetaV2,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import { type StandardNodeType } from '@coze-workflow/base';

import { settingOnErrorValidate } from '@/nodes-v2/materials/setting-on-error-validate';
import { createProvideNodeBatchVariables } from '@/nodes-v2/materials/provide-node-batch-variable';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { createNodeInputNameValidate } from '@/nodes-v2/components/node-input-name/validate';
import { createValueExpressionInputValidate } from '@/node-registries/common/validators';
import {
  fireNodeTitleChange,
  provideNodeOutputVariablesEffect,
} from '@/node-registries/common/effects';

import { type FormData } from './types';
import { FormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
import { BATCH_INPUT_LIST_PATH, BATCH_MODE_PATH } from './constants';

export const SUB_WORKFLOW_FORM_META: FormMetaV2<FormData> = {
  // Node form rendering
  render: props => <FormRender {...props} />,

  // verification trigger timing
  validateTrigger: ValidateTrigger.onChange,

  // validation rules
  validate: {
    nodeMeta: nodeMetaValidate,
    // Verify imported parameters
    'inputs.inputParameters.*': createValueExpressionInputValidate({
      // Whether it is required or not needs to be calculated according to the function to obtain the required value of the corresponding field
      required: ({ name, context }) => {
        const { node } = context;

        const subWorkflow = (node as FlowNodeEntity)
          .getData<WorkflowNodeData>(WorkflowNodeData)
          .getNodeData<StandardNodeType.SubWorkflow>();

        const fieldName = (name as string).replace(
          'inputs.inputParameters.',
          '',
        );

        const inputDef = subWorkflow?.inputsDefinition?.find(
          v => v.name === fieldName,
        );
        return Boolean(inputDef?.required);
      },
    }),

    // Verify the names of batch imported parameters
    'inputs.batch.inputLists.*.name': createNodeInputNameValidate({
      getNames: ({ formValues }) =>
        (get(formValues, 'batch.inputLists') || []).map(item => item.name),
      skipValidate: ({ formValues }) =>
        formValues?.inputs?.batchMode === 'single',
    }),

    // Validation of batch imported parameters
    'inputs.batch.inputLists.*.input': createValueExpressionInputValidate({
      required: true,
      skipValidate: ({ formValues }) =>
        formValues?.inputs?.batchMode === 'single',
    }),

    settingOnError: settingOnErrorValidate,
  },

  // Side effect management
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,

    [BATCH_MODE_PATH]: createProvideNodeBatchVariables(
      BATCH_MODE_PATH,
      BATCH_INPUT_LIST_PATH,
    ),

    [BATCH_INPUT_LIST_PATH]: createProvideNodeBatchVariables(
      BATCH_MODE_PATH,
      BATCH_INPUT_LIST_PATH,
    ),
  },

  // Node Backend Data - > Frontend Form Data
  formatOnInit: transformOnInit,

  // Front-end form data - > node back-end data
  formatOnSubmit: transformOnSubmit,
};
