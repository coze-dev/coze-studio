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

import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';
import { type InputValueVO } from '@coze-workflow/base';

import { fireNodeTitleChange } from '@/nodes-v2/materials/fire-node-title-change';
import { createValueExpressionInputValidate } from '@/nodes-v2/materials/create-value-expression-input-validate';

import { transformOnSubmit } from '../transform-on-submit';
import { createTransformOnInit } from '../transform-on-init';
import { syncConversationNameEffect } from '../sync-conversation-name-effect';
import { provideNodeOutputVariablesEffect } from '../../materials/provide-node-output-variables';
import FormRender from './form-render';
import { DEFAULT_CONVERSATION_VALUE, DEFAULT_OUTPUTS } from './constants';

interface FormData {
  inputParameters: InputValueVO[];
}

export const CLEAR_CONTEXT_FORM_META: FormMetaV2<FormData> = {
  // Node form rendering
  render: () => <FormRender />,

  // verification trigger timing
  validateTrigger: ValidateTrigger.onChange,

  // validation rules
  validate: {
    // Required
    'inputParameters.0.input': createValueExpressionInputValidate({
      required: true,
    }),
  },

  // Side effect management
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
    inputParameters: syncConversationNameEffect,
  },

  // Node Backend Data - > Frontend Form Data
  formatOnInit: createTransformOnInit(
    DEFAULT_CONVERSATION_VALUE,
    DEFAULT_OUTPUTS,
  ),

  // Front-end form data - > node back-end data
  formatOnSubmit: transformOnSubmit,
};
