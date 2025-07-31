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

/* eslint-disable @typescript-eslint/naming-convention */
import {
  ViewVariableType,
  type ViewVariableTreeNode,
} from '@coze-workflow/base';

// Type mapping to be converted
const ViewVariableType2JsonSchema = {
  [ViewVariableType.ArrayObject]: {
    type: 'array',
    items: {
      type: 'object',
    },
  },
  [ViewVariableType.ArrayImage]: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
  [ViewVariableType.ArrayTime]: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
  [ViewVariableType.ArrayBoolean]: {
    type: 'array',
    items: {
      type: 'boolean',
    },
  },
  [ViewVariableType.ArrayNumber]: {
    type: 'array',
    items: {
      type: 'number',
    },
  },
  [ViewVariableType.ArrayInteger]: {
    type: 'array',
    items: {
      type: 'integer',
    },
  },
  [ViewVariableType.ArrayString]: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
  [ViewVariableType.Object]: {
    type: 'object',
  },
  [ViewVariableType.Image]: {
    type: 'string',
  },
  [ViewVariableType.Time]: {
    type: 'string',
  },
  [ViewVariableType.Boolean]: {
    type: 'boolean',
  },
  [ViewVariableType.Number]: {
    type: 'number',
  },
  [ViewVariableType.Integer]: {
    type: 'integer',
  },
  [ViewVariableType.String]: {
    type: 'string',
  },
};

const generate = (meta: ViewVariableTreeNode) => {
  const { type, children = [] } = meta;
  const jsonSchema = ViewVariableType2JsonSchema[type];
  if (
    type === ViewVariableType.Object ||
    type === ViewVariableType.ArrayObject
  ) {
    const properties = {};
    for (const child of children) {
      properties[child.name] = generate(child);
    }

    return type === ViewVariableType.Object
      ? {
          ...jsonSchema,
          properties,
        }
      : {
          ...jsonSchema,
          items: {
            type: 'object',
            properties,
          },
        };
  }
  return jsonSchema;
};

// Generate default JSON schema from meta
export const generateJSONSchema = (
  outputs: ViewVariableTreeNode[] | undefined,
) => ({
  type: 'object',
  properties: (outputs || [])
    .filter(m => m && !(m as unknown as { readonly: boolean }).readonly)
    .reduce(
      (pre, cur) => ({
        ...pre,
        [cur.name]: generate(cur),
      }),
      {},
    ),
});
