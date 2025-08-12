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
import { isUndefined, isString, get, isObject, set } from 'lodash-es';
import {
  type IFormSchema,
  TestFormFieldName,
} from '@coze-workflow/test-run-next';
import { ViewVariableType } from '@coze-workflow/base';

import { visitNodeLeaf } from './visit-node-leaf';
import { formatValues } from './format-values';

const isEmpty = (v: any) => {
  if (isUndefined(v)) {
    return true;
  }
  if (isString(v) && (v === '' || v === '[]' || v === '{}')) {
    return true;
  }
  return false;
};

interface MergeFormValuesOptions {
  mode: 'json' | 'form';
  originFormSchema: IFormSchema;
  prevValues?: any;
  nextValues?: any;
  ai?: boolean;
  cover?: boolean;
}

export const mergeFormValues = (options: MergeFormValuesOptions) => {
  const { mode, originFormSchema, prevValues, nextValues, ai, cover } = options;
  const preFormattedValues = formatValues({
    originFormSchema,
    formValues: prevValues,
    mode,
  });
  const finialValues = {};
  const getValue = (path: string[], type: ViewVariableType) => {
    const prev = get(preFormattedValues, path);
    let next = get(nextValues, path);
    if (isObject(next)) {
      next = JSON.stringify(next, undefined, 2);
    }
    // AI scene to discard file type
    if (ai && ViewVariableType.isFileType(type)) {
      return prev;
    }
    /**
     * 1. If it is null, overwrite it directly
     * 2. If it is mandatory coverage, it is also directly covered.
     */
    if (isEmpty(prev) || cover) {
      return next;
    }
    return prev;
  };

  Object.entries(originFormSchema.properties || {}).forEach(
    ([parentKey, parent]) => {
      if (parentKey !== TestFormFieldName.Node) {
        finialValues[parentKey] =
          nextValues?.[parentKey] || prevValues?.[parentKey];
        return;
      }
      visitNodeLeaf(parent.properties, (groupKey, key, field) => {
        const next = getValue(
          [parentKey, groupKey, key],
          field['x-origin-type'] as any,
        );
        set(finialValues, [parentKey, groupKey, key], next);
      });
    },
  );
  return finialValues;
};
