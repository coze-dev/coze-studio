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
import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';

import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { fireNodeTitleChange } from '@/nodes-v2/materials/fire-node-title-change';
import { createValueExpressionInputValidate } from '@/node-registries/common/validators';

import FormRender from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';

const datasetParamFieldName = 'inputs.datasetParameters.datasetParam';

export const DATASET_NODE_FORM_META: FormMetaV2<FormData> = {
  // Node form rendering
  render: () => <FormRender />,

  // verification trigger timing
  validateTrigger: ValidateTrigger.onBlur,

  // validation rules
  validate: {
    nodeMeta: nodeMetaValidate,
    'inputs.inputParameters.Query': createValueExpressionInputValidate({
      required: true,
    }),
    [datasetParamFieldName]: ({ value }) => {
      if (!value || value.length === 0) {
        return I18n.t('workflow_detail_knowledge_error_empty');
      }
      return undefined;
    },
  },

  // Side effect management
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },

  // Node Backend Data - > Frontend Form Data
  formatOnInit: transformOnInit,

  // Front-end form data - > node back-end data
  formatOnSubmit: transformOnSubmit,
};
