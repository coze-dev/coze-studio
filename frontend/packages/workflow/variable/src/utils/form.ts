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

import { set } from 'lodash-es';
import {
  type FormModelV2,
  isFormV2,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

export function setValueIn(
  node: FlowNodeEntity,
  path: string,
  nextValue: unknown,
) {
  const formData = node.getData(FlowNodeFormData);
  // New form engine updates data
  if (isFormV2(node)) {
    (formData.formModel as FormModelV2).setValueIn(path, nextValue);
    return;
  }

  // Old form engine updates data
  const fullData = formData.formModel.getFormItemValueByPath('/');
  set(fullData, path, nextValue);

  return;
}
