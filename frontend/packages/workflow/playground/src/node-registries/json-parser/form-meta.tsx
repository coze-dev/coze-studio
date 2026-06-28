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

import { createValueExpressionInputValidate } from '@/node-registries/common/validators';
import { outputTreeMetaValidator } from '@/node-registries/common/fields/outputs';
import {
  fireNodeTitleChange,
  provideNodeOutputVariablesEffect,
} from '@/node-registries/common/effects';

import { type FormData } from './types';
import { FormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';

export const JSON_PARSER_FORM_META: FormMetaV2<FormData> = {
  render: () => <FormRender />,

  validateTrigger: ValidateTrigger.onChange,

  validate: {
    'inputs.inputParameters.0.input': createValueExpressionInputValidate({
      required: true,
    }),
    outputs: outputTreeMetaValidator,
  },

  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },

  formatOnInit: transformOnInit,

  formatOnSubmit: transformOnSubmit,
};
