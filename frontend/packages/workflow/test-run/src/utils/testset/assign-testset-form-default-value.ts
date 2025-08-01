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

import { isNil } from 'lodash-es';

import { type FormItemSchema } from '../../types';
import { FormItemSchemaType } from '../../constants';

export function assignTestsetFormDefaultValue(ipt: FormItemSchema) {
  if (!isNil(ipt.value)) {
    return;
  }

  switch (ipt.type) {
    case FormItemSchemaType.BOOLEAN:
      // ipt.value = true;
      break;
    case FormItemSchemaType.OBJECT:
      ipt.value = '{}';
      break;
    case FormItemSchemaType.LIST:
      ipt.value = '[]';
      break;
    default:
      break;
  }
}
