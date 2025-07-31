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
import { type IFormSchema } from '@coze-workflow/test-run-next';

interface SetCacheValuesOptions {
  properties: IFormSchema['properties'];
  defaultValues: any;
  /** Whether to force the use of defaultValues data */
  force?: boolean;
}

export const setDefaultValues = ({
  properties,
  defaultValues,
  force,
}: SetCacheValuesOptions) => {
  if (!properties) {
    return;
  }
  Object.keys(properties).forEach(key => {
    const field = properties[key];
    const value = defaultValues?.[key];
    if (field.type === 'object') {
      setDefaultValues({
        properties: field.properties,
        defaultValues: value,
        force,
      });
      return;
    }
    if (!isUndefined(value) || force) {
      field.defaultValue = value;
    }
  });
};
