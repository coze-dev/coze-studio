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

// import { get } from 'lodash-es';
import {
  type Effect,
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';
import { DEFAULT_DELIMITER_OPTIONS } from '@coze-workflow/nodes';

import { getDefaultOutput, isSplitMethod } from '../utils';

export const handleMethodChangeEffect: Effect = props => {
  const { value, context } = props;
  const { node } = context;

  const formModel = node.getData(FlowNodeFormData).getFormModel<FormModelV2>();

  if (!formModel) {
    return;
  }

  formModel.setValueIn('outputs', getDefaultOutput(value));

  if (isSplitMethod(value)) {
    formModel.setValueIn('delimiter', {
      value: [],
      options: DEFAULT_DELIMITER_OPTIONS,
    });
  }

  formModel.setValueIn('inputParameters', [
    { name: isSplitMethod(value) ? 'String' : 'String1' },
  ]);
};
