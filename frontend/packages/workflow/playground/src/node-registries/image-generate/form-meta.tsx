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
import { get, set } from 'lodash-es';
import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { ValueExpressionService } from '@/services';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import {
  fireNodeTitleChange,
  provideNodeOutputVariablesEffect,
} from '@/node-registries/common/effects';

import { type FormData } from './types';
import { FormRender } from './form';

export const IMAGE_GENERATE_FORM_META: FormMetaV2<FormData> = {
  // Node form rendering
  render: () => <FormRender />,

  // verification trigger timing
  validateTrigger: ValidateTrigger.onChange,

  // validation rules
  validate: {
    nodeMeta: nodeMetaValidate,
    ['inputs.modelSetting.model']: ({ value, formValues }) => {
      const invalidPreprocessors = {
        1: [4, 5, 6],
        8: [1, 2, 3, 4, 5, 6, 7],
        3: [7],
        6: [6, 7],
      };

      // Get references field
      const references = formValues?.inputs?.references || [];

      // Gets an array of invalid preprocessor values corresponding to the value
      const invalidValues = invalidPreprocessors[value] || [];

      // Check if the preprocessor in the references contains invalid values
      for (const reference of references) {
        if (invalidValues.includes(reference?.preprocessor)) {
          return I18n.t('Imageflow_not_support');
        }
      }
    },
    ['inputs.prompt.prompt']: ({ value }) => {
      if (!value) {
        return I18n.t('workflow_detail_node_error_empty');
      }
    },
  },

  // Side effect management
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },

  // default value
  defaultValues: () => ({
    inputs: {
      modelSetting: {
        model: 1,
        custom_ratio: {
          width: 1024,
          height: 1024,
        },
        ddim_steps: 25,
      },
      references: [],
      prompt: {
        prompt: '',
        negative_prompt: '',
      },
      inputParameters: [],
    },
    outputs: [
      {
        key: nanoid(),
        name: 'data',
        type: ViewVariableType.Image,
      },
      {
        key: nanoid(),
        name: 'msg',
        type: ViewVariableType.String,
      },
    ],
  }),

  formatOnInit(value, context) {
    const { node } = context;
    const valueExpressionService = node.getService<ValueExpressionService>(
      ValueExpressionService,
    );

    const references = get(value, 'inputs.references') || [];
    set(
      value,
      'inputs.references',
      references.map(item => ({
        ...item,
        url: valueExpressionService.toVO(item.url),
      })),
    );

    return value;
  },

  formatOnSubmit(value, context) {
    const { node } = context;
    const valueExpressionService = node.getService<ValueExpressionService>(
      ValueExpressionService,
    );

    const references = get(value, 'inputs.references') || [];
    set(
      value,
      'inputs.references',
      references.map(item => ({
        ...item,
        url: valueExpressionService.toDTO(item.url),
      })),
    );

    return value;
  },
};
