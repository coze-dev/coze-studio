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

import { type SchemaObject } from 'ajv';
import {
  VariableTypeDTO,
  type VariableMetaDTO,
  AssistTypeDTO,
} from '@coze-workflow/base';

// Type mapping to be converted
const VariableType2JsonSchemaProps = {
  [VariableTypeDTO.object]: {
    type: 'object',
  },
  [VariableTypeDTO.list]: {
    type: 'array',
  },
  [VariableTypeDTO.float]: {
    type: 'number',
  },
  [VariableTypeDTO.integer]: {
    type: 'integer',
  },
  [VariableTypeDTO.boolean]: {
    type: 'boolean',
  },
  [VariableTypeDTO.string]: {
    type: 'string',
  },
  [VariableTypeDTO.time]: {
    type: 'string',
  },
};

const inputToJsonSchema = (
  input,
  level = 0,
  transformer?: (input: unknown) => VariableMetaDTO,
): SchemaObject | undefined => {
  const _input = transformer ? transformer(input) : input;
  const { type, description } = _input;
  const props = VariableType2JsonSchemaProps[type];
  if (type === VariableTypeDTO.object) {
    const properties = {};
    const required: string[] = [];
    for (const field of _input.schema) {
      properties[field.name] = inputToJsonSchema(field, level + 1, transformer);
      if (field.required) {
        required.push(field.name);
      }
    }
    return {
      ...props,
      description,
      required,
      properties,
    };
  } else if (type === VariableTypeDTO.list) {
    return {
      ...props,
      description,
      items: inputToJsonSchema(_input.schema, level + 1, transformer),
    };
  }
  // The basic type does not need to generate jsonSchema, and the image type does not need jsonSchema. It directly throws an exception and jumps out of recursion.
  if (
    level === 0 ||
    type === 'image' ||
    (_input.assistType && _input.assistType !== AssistTypeDTO.time)
  ) {
    throw Error('not json type');
  }

  return { ...props, description };
};

export const generateInputJsonSchema = (
  input: VariableMetaDTO,
  transformer?: (input: unknown) => VariableMetaDTO,
): SchemaObject | undefined => {
  try {
    const jsonSchema = inputToJsonSchema(input, 0, transformer);
    return jsonSchema;
  } catch {
    return undefined;
  }
};
