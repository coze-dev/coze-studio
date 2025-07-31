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

import { isObject, get, has, isArray } from 'lodash-es';
import { type WorkflowVariable } from '@coze-workflow/variable';
import { type DTODefine } from '@coze-workflow/base';

/**
 * Traverse variable references in DTO JSON
 * @param data
 * @param cb
 * @returns
 */
export function traverseRefsInNodeJSON(
  data: unknown,
  cb: (_ref: DTODefine.RefExpression) => void,
) {
  if (isObject(data)) {
    // Determine if it conforms to the structure of ValueExpressionDTO
    if (
      get(data, 'type') === 'ref' &&
      get(data, 'content.source') === 'block-output' &&
      has(data, 'content.blockID') &&
      has(data, 'content.name')
    ) {
      cb(data as unknown as DTODefine.RefExpression);
    }

    Object.entries(data).forEach(([_key, _val]) => {
      traverseRefsInNodeJSON(_val, cb);
    }, {});
    return;
  }

  if (isArray(data)) {
    data.forEach(_item => {
      traverseRefsInNodeJSON(_item, cb);
    });
  }
}

/**
 * variable sort
 * @param variable
 * @returns
 */
export const variableOrder = (name?: string) => {
  const orders = {
    USER_INPUT: 2,
    CONVERSATION_NAME: 1,
  };
  return orders[name ?? ''] || 0;
};

export const sortVariables = (variables: WorkflowVariable[]) => {
  if (!variables) {
    return variables;
  }

  return variables.sort(
    (a, b) =>
      variableOrder(b?.viewMeta?.name) - variableOrder(a?.viewMeta?.name),
  );
};
