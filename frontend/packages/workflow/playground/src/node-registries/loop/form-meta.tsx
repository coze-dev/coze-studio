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
  LoopArrayNameValidator,
  LoopArrayValueValidator,
  LoopInputNameValidator,
  LoopInputValueValidator,
  LoopOutputNameValidator,
} from './validators';
import { type FormData } from './types';
import { LoopFormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
import { LoopPath } from './constants';

export const LOOP_FORM_META: FormMetaV2<FormData> = {
  // Node form rendering
  render: () => <LoopFormRender />,

  // verification trigger timing
  validateTrigger: ValidateTrigger.onChange,

  // validation rules
  validate: {
    nodeMeta: nodeMetaValidate,
    [`${LoopPath.LoopArray}.*.name`]: LoopArrayNameValidator,
    [`${LoopPath.LoopArray}.*.input`]: LoopArrayValueValidator,
    [`${LoopPath.LoopVariables}.*.name`]: LoopInputNameValidator,
    [`${LoopPath.LoopVariables}.*.input`]: LoopInputValueValidator,
    [`${LoopPath.LoopOutputs}.*.name`]: LoopOutputNameValidator,
    [`${LoopPath.LoopOutputs}.*.input`]: LoopInputValueValidator,
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
