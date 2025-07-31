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
import { I18n } from '@coze-arch/i18n';
import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';

import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { createValueExpressionInputValidate } from '@/node-registries/common/validators';
import { fireNodeTitleChange } from '@/node-registries/common/effects';

import FormRender from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';

const datasetParamFieldName = 'inputs.datasetParameters.datasetParam';
const separatorFieldName =
  'inputs.datasetWriteParameters.chunkStrategy.separator';

export const DATASET_WRITE_FORM_META: FormMetaV2<FormData> = {
  render: () => <FormRender />,

  validateTrigger: ValidateTrigger.onBlur,

  validate: {
    nodeMeta: nodeMetaValidate,
    'inputs.inputParameters.knowledge': createValueExpressionInputValidate({
      required: true,
    }),
    [datasetParamFieldName]: ({ value }) => {
      if (!value || value.length === 0) {
        return I18n.t('workflow_detail_knowledge_error_empty');
      }
      return undefined;
    },
    [separatorFieldName]: ({ value, formValues }) => {
      const separatorType = get(
        formValues,
        'inputs.datasetWriteParameters.chunkStrategy.separatorType',
      );

      if (separatorType === 'custom' && !value) {
        return I18n.t('datasets_custom_segmentID_error');
      }

      return undefined;
    },
  },

  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },

  // Node Backend Data - > Frontend Form Data
  formatOnInit: transformOnInit,

  // Front-end form data - > node back-end data
  formatOnSubmit: transformOnSubmit,
};
