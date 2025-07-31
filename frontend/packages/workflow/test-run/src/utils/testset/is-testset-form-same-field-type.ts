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

import { FormItemSchemaType } from '../../constants';

function isNumberType(t: string) {
  return t === FormItemSchemaType.NUMBER || t === FormItemSchemaType.FLOAT;
}

/** Determine that the type is consistent, ** specialization: ** 'number' and'float 'are regarded as the same type */
export const isTestsetFormSameFieldType = (t1?: string, t2?: string) => {
  if (typeof t1 === 'undefined' || typeof t2 === 'undefined') {
    return false;
  }

  return isNumberType(t1) ? isNumberType(t2) : t1 === t2;
};
