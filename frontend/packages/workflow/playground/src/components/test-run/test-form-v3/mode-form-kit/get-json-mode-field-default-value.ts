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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable complexity */
import { toNumber, isUndefined } from 'lodash-es';
import { safeJsonParse } from '@coze-workflow/test-run-next';
import { ViewVariableType } from '@coze-workflow/base';

const generateJsonSchemaFileValue = (value: string) => {
  if (!value) {
    return value;
  }
  return `<#file:${value}#>`;
};
const generateJsonSchemaVoiceValue = (value: string) => {
  if (!value) {
    return value;
  }
  return `<#voice:${value}#>`;
};

export const getJsonModeFieldDefaultValue = (
  type: ViewVariableType,
  value: any,
) => {
  let temp = value;
  // Complex types such as objects and arrays require deserialization
  if (
    type === ViewVariableType.Object ||
    type >= ViewVariableType.ArrayString
  ) {
    temp = safeJsonParse(temp);
  }
  // timbre
  if (ViewVariableType.isVoiceType(type)) {
    temp = generateJsonSchemaVoiceValue(temp);
    // Files other than timbre
  } else if (ViewVariableType.isFileType(type)) {
    if (ViewVariableType.isArrayType(type)) {
      temp = temp?.map(generateJsonSchemaFileValue);
    } else {
      temp = generateJsonSchemaFileValue(temp);
    }
  }

  // The number type needs to be converted to bigNumber to ensure value safety
  if (type === ViewVariableType.Integer || type === ViewVariableType.Number) {
    temp = toNumber(temp) || 0;
  }

  if (!isUndefined(temp)) {
    return temp;
  }
  if (type === ViewVariableType.Integer || type === ViewVariableType.Number) {
    return 0;
  }
  if (type === ViewVariableType.Boolean) {
    return true;
  }
  if (type === ViewVariableType.Object) {
    return {};
  }
  if (type >= ViewVariableType.ArrayString) {
    return [];
  }
  return '';
};
