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

import { get, isEmpty } from 'lodash-es';
import { VariableTypeDTO } from '@coze-workflow/base';

interface ListRefSchema {
  type: 'list';
  value: {
    type: 'ref';
    content: {
      source: string;
      blockID: string;
      name: string;
    };
  };
}

export const toListRefSchema = (value: string[]): ListRefSchema => {
  const [nodeId, ...keyPaths] = value;
  return {
    type: VariableTypeDTO.list,
    value: {
      type: 'ref',
      content: {
        source: 'block-output',
        blockID: `${nodeId}`,
        name: keyPaths.join('.'), // This is the variable that uses the current loop, with the fixed name item.
      },
    },
  };
};

export const listRefSchemaToValue = (
  listRefSchema: ListRefSchema,
): string[] => {
  if (!listRefSchema || isEmpty(listRefSchema)) {
    return [];
  }
  const nodeId = get(listRefSchema, 'value.content.blockID', '');
  const keys = get(listRefSchema, 'value.content.name', '');

  if (!nodeId) {
    return [];
  }

  return [nodeId].concat(keys ? keys.split('.') : []);
};
