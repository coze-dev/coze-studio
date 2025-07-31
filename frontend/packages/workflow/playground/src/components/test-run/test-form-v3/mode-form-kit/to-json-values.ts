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
import { get, set } from 'lodash-es';
import {
  type IFormSchema,
  TestFormFieldName,
} from '@coze-workflow/test-run-next';

import { visitNodeLeaf } from './visit-node-leaf';
import { getJsonModeFieldDefaultValue } from './get-json-mode-field-default-value';

export const toJsonValues = (
  schema: IFormSchema,
  values?: Record<string, any>,
) => {
  if (!values) {
    return values;
  }
  const jsonValue = get(values, TestFormFieldName.Node);
  /** If it cannot be parsed normally, it will be ignored directly. */
  if (!jsonValue) {
    return values;
  }
  const formatJsonValue: Record<string, any> = {};
  const nodeFieldProperties =
    schema.properties?.[TestFormFieldName.Node]?.properties;
  visitNodeLeaf(nodeFieldProperties, (groupKey, key, field) => {
    const groupValues = formatJsonValue[groupKey] || {};
    groupValues[key] = getJsonModeFieldDefaultValue(
      field['x-origin-type'] as any,
      get(jsonValue, [groupKey, key]),
    );
    formatJsonValue[groupKey] = groupValues;
  });
  set(values, TestFormFieldName.Node, {
    [TestFormFieldName.JSON]: JSON.stringify(formatJsonValue, undefined, 2),
  });
  return values;
};
