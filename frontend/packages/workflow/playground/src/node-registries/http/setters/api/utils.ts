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

import { ViewVariableType } from '@coze-workflow/base';

export function transJsTypeToViewVariableType(value: unknown) {
  switch (typeof value) {
    case 'string':
      return ViewVariableType.String;
    case 'number':
      return ViewVariableType.Number;
    case 'boolean':
      return ViewVariableType.Boolean;
    default:
      return ViewVariableType.String;
  }
}

export function transStringParamsToFormData(params: Record<string, string>) {
  if (!params) {
    return [];
  }
  return Object.entries(params).map(([key, value]) => ({
    name: key,
    type: transJsTypeToViewVariableType(value),
    input: { type: 'literal', content: value },
  }));
}
