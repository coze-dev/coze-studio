/* eslint-disable @typescript-eslint/naming-convention */

import { type SchemaObject } from 'ajv';
import {
  VariableTypeDTO,
  type VariableMetaDTO,
  AssistTypeDTO,
} from '@coze-workflow/base';

// 需要转化的类型映射
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
  // 基础类型不需要生成jsonSchema, 图片类型不需要jsonSchema, 直接抛异常跳出递归
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
