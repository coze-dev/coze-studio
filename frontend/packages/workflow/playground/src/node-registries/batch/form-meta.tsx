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

import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import {
  fireNodeTitleChange,
  provideLoopInputsVariablesEffect,
  provideLoopOutputsVariablesEffect,
} from '@/node-registries/common/effects';

import {
  BatchInputNameValidator,
  BatchInputValueValidator,
  BatchOutputNameValidator,
} from './validators';
import { type FormData } from './types';
import { BatchFormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
import { BatchPath } from './constants';

export const BATCH_FORM_META: FormMetaV2<FormData> = {
  // Node form rendering
  render: () => <BatchFormRender />,

  // verification trigger timing
  validateTrigger: ValidateTrigger.onChange,

  // validation rules
  validate: {
    nodeMeta: nodeMetaValidate,
    [`${BatchPath.Inputs}.*.name`]: BatchInputNameValidator,
    [`${BatchPath.Inputs}.*.input`]: BatchInputValueValidator,
    [`${BatchPath.Outputs}.*.name`]: BatchOutputNameValidator,
    [`${BatchPath.Outputs}.*.input`]: BatchInputValueValidator,
  },

  // Side effect management
  effect: {
    nodeMeta: fireNodeTitleChange,
    inputs: provideLoopInputsVariablesEffect,
    outputs: provideLoopOutputsVariablesEffect,
  },

  // Node Backend Data - > Frontend Form Data
  formatOnInit: transformOnInit,

  // Front-end form data - > node back-end data
  formatOnSubmit: transformOnSubmit,
};
