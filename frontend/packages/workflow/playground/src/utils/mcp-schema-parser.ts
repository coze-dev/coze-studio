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

export interface McpSchemaProperty {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  format?: string;
  items?: McpSchemaProperty;
  properties?: McpSchemaProperty[];
}

export interface ParsedMcpSchema {
  inputParams: McpSchemaProperty[];
  outputSchema?: object;
}

// 解析MCP工具的JSON Schema
export function parseToolSchema(schemaString: string): ParsedMcpSchema {
  try {
    const schema = JSON.parse(schemaString);
    const inputParams = parseProperties(
      schema.properties || {},
      schema.required || [],
    );

    return {
      inputParams,
      outputSchema: schema,
    };
  } catch (error) {
    console.error('Failed to parse MCP schema:', error);
    return {
      inputParams: [],
      outputSchema: undefined,
    };
  }
}

// 解析schema的properties字段
function parseProperties(
  properties: Record<string, unknown>,
  required: string[],
): McpSchemaProperty[] {
  return Object.entries(properties).map(([name, property]) => {
    const prop = property as Record<string, unknown>;
    const param: McpSchemaProperty = {
      name,
      type: (prop.type as string) || 'string',
      description: prop.description as string,
      required: required.includes(name),
      format: prop.format as string,
    };

    // 处理数组类型
    if (prop.type === 'array' && prop.items) {
      const items = prop.items as Record<string, unknown>;
      param.items = {
        name: 'item',
        type: (items.type as string) || 'string',
        description: items.description as string,
        required: false,
      };
    }

    // 处理对象类型的嵌套属性
    if (prop.type === 'object' && prop.properties) {
      param.properties = parseProperties(
        prop.properties as Record<string, unknown>,
        (prop.required as string[]) || [],
      );
    }

    return param;
  });
}

// 为参数生成默认值
export function generateDefaultValue(param: McpSchemaProperty): unknown {
  switch (param.type) {
    case 'string':
      return '';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      if (param.properties) {
        const obj: Record<string, unknown> = {};
        param.properties.forEach(prop => {
          obj[prop.name] = generateDefaultValue(prop);
        });
        return obj;
      }
      return {};
    default:
      return '';
  }
}

// 生成参数的UI类型标签
export function getTypeLabel(param: McpSchemaProperty): string {
  if (param.type === 'array' && param.items) {
    return `Array<${param.items.type}>`;
  }
  return param.type;
}

// 验证参数类型的辅助函数
function validateParamType(
  param: McpSchemaProperty,
  value: unknown,
): { valid: boolean; error?: string } {
  const validators: Record<string, () => { valid: boolean; error?: string }> = {
    string: () =>
      typeof value !== 'string'
        ? { valid: false, error: `${param.name} must be a string` }
        : { valid: true },
    number: () =>
      typeof value !== 'number'
        ? { valid: false, error: `${param.name} must be a number` }
        : { valid: true },
    integer: () => {
      if (typeof value !== 'number') {
        return { valid: false, error: `${param.name} must be a number` };
      }
      if (!Number.isInteger(value)) {
        return { valid: false, error: `${param.name} must be an integer` };
      }
      return { valid: true };
    },
    boolean: () =>
      typeof value !== 'boolean'
        ? { valid: false, error: `${param.name} must be a boolean` }
        : { valid: true },
    array: () =>
      !Array.isArray(value)
        ? { valid: false, error: `${param.name} must be an array` }
        : { valid: true },
    object: () =>
      typeof value !== 'object' || Array.isArray(value)
        ? { valid: false, error: `${param.name} must be an object` }
        : { valid: true },
  };

  const validator = validators[param.type] || validators.string;
  return validator();
}

// 验证参数值是否符合schema
export function validateParam(
  param: McpSchemaProperty,
  value: unknown,
): { valid: boolean; error?: string } {
  if (
    param.required &&
    (value === null || value === undefined || value === '')
  ) {
    return { valid: false, error: `${param.name} is required` };
  }

  if (value === null || value === undefined || value === '') {
    return { valid: true };
  }

  // 验证类型
  const typeValidation = validateParamType(param, value);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  return { valid: true };
}
