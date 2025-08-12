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
  type Effect,
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';

import { formatOutput } from '../utils';

export const syncQuestionOutputsEffect: Effect = props => {
  const { value, formValues, context } = props;
  const { node } = context;

  const formModel = node.getData(FlowNodeFormData).getFormModel<FormModelV2>();
  const outputs = get(formValues, 'outputs');

  // Synchronize the value of questionOutputs to outputs
  if (outputs) {
    formModel.setValueIn('outputs', formatOutput(value));
  }
};
