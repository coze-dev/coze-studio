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
import { isUndefined } from 'lodash-es';
import {
  type IFormSchema,
  safeJsonParse,
  TestFormFieldName,
} from '@coze-workflow/test-run-next';
import { ViewVariableType } from '@coze-workflow/base';

import { visitNodeLeaf } from './visit-node-leaf';
import { getFileInfo } from './file-info';

const getFormSchemaFileUrl = (value: string) => {
  if (!value) {
    return undefined;
  }
  const match = value.match(/<#file:(https?:.+?)#>/);
  // Unknown string format reserved
  if (!match) {
    return value;
  }
  const fileInfo = getFileInfo(match[1]);
  // The value that has not been uploaded is directly discarded.
  if (fileInfo.uploading) {
    return undefined;
  }
  return match[1];
};

const getFormSchemaVoiceId = (value: string) => {
  if (!value) {
    return undefined;
  }
  const match = value.match(/<#voice:(\d+)#>/);
  // Unknown string reservation
  if (!match) {
    return value;
  }
  return match[1];
};

const generateJsonSchemaToFormValue = (type: ViewVariableType, value: any) => {
  if (isUndefined(value)) {
    return value;
  }
  let temp = value;
  // timbre
  if (ViewVariableType.isVoiceType(type)) {
    temp = getFormSchemaVoiceId(temp);
    // if (!force && !temp) {
    //   temp = '';
    // }
    // Files other than timbre
  } else if (ViewVariableType.isFileType(type)) {
    if (ViewVariableType.isArrayType(type)) {
      temp = temp?.map(getFormSchemaFileUrl);
      // For files, if the array is empty, it should be empty
      if (!temp?.length) {
        // temp = force ? undefined : [];
        temp = undefined;
      }
    } else {
      temp = getFormSchemaFileUrl(temp);
      // if (!force && !temp) {
      //   temp = '';
      // }
    }
  }
  // Complex types such as objects and arrays require serialization
  if (
    type === ViewVariableType.Object ||
    type >= ViewVariableType.ArrayString
  ) {
    temp = JSON.stringify(temp, undefined, 2);
  }
  return temp;
};

interface ToValuesOptions {
  mode: 'json' | 'form';
  originFormSchema: IFormSchema;
  formValues: any;
  /** Whether to force the use of cacheData data */
  force?: boolean;
}

export const formatValues = ({
  mode,
  originFormSchema,
  formValues,
}: ToValuesOptions) => {
  if (mode === 'form' || !formValues) {
    return formValues;
  }
  const jsonValues = safeJsonParse(
    formValues?.[TestFormFieldName.Node]?.[TestFormFieldName.JSON],
  );
  const nodeField = originFormSchema.properties?.[TestFormFieldName.Node];
  const nodeProperties = nodeField?.properties;
  if (!jsonValues || !nodeProperties) {
    return formValues;
  }

  const formatJsonValues: Record<string, any> = {};
  visitNodeLeaf(nodeProperties, (groupKey, key, field) => {
    const groupValues = formatJsonValues[groupKey] || {};
    groupValues[key] = generateJsonSchemaToFormValue(
      field['x-origin-type'] || ('' as any),
      jsonValues?.[groupKey]?.[key],
    );
    formatJsonValues[groupKey] = groupValues;
  });
  formValues[TestFormFieldName.Node] = formatJsonValues;
  return formValues;
};
