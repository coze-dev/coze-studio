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

export class McpSchemaParser {
  // 解析MCP工具的JSON Schema
  static parseToolSchema(schemaString: string): ParsedMcpSchema {
    try {
      const schema = JSON.parse(schemaString);
      const inputParams = this.parseProperties(schema.properties || {}, schema.required || []);
      
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
  private static parseProperties(properties: Record<string, any>, required: string[]): McpSchemaProperty[] {
    return Object.entries(properties).map(([name, property]) => {
      const param: McpSchemaProperty = {
        name,
        type: property.type || 'string',
        description: property.description,
        required: required.includes(name),
        format: property.format,
      };

      // 处理数组类型
      if (property.type === 'array' && property.items) {
        param.items = {
          name: 'item',
          type: property.items.type || 'string',
          description: property.items.description,
          required: false,
        };
      }

      // 处理对象类型的嵌套属性
      if (property.type === 'object' && property.properties) {
        param.properties = this.parseProperties(
          property.properties,
          property.required || []
        );
      }

      return param;
    });
  }

  // 为参数生成默认值
  static generateDefaultValue(param: McpSchemaProperty): any {
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
          const obj: Record<string, any> = {};
          param.properties.forEach(prop => {
            obj[prop.name] = this.generateDefaultValue(prop);
          });
          return obj;
        }
        return {};
      default:
        return '';
    }
  }

  // 生成参数的UI类型标签
  static getTypeLabel(param: McpSchemaProperty): string {
    if (param.type === 'array' && param.items) {
      return `Array<${param.items.type}>`;
    }
    return param.type;
  }

  // 验证参数值是否符合schema
  static validateParam(param: McpSchemaProperty, value: any): { valid: boolean; error?: string } {
    if (param.required && (value === null || value === undefined || value === '')) {
      return { valid: false, error: `${param.name} is required` };
    }

    if (value === null || value === undefined || value === '') {
      return { valid: true };
    }

    switch (param.type) {
      case 'string':
        if (typeof value !== 'string') {
          return { valid: false, error: `${param.name} must be a string` };
        }
        break;
      case 'number':
      case 'integer':
        if (typeof value !== 'number') {
          return { valid: false, error: `${param.name} must be a number` };
        }
        if (param.type === 'integer' && !Number.isInteger(value)) {
          return { valid: false, error: `${param.name} must be an integer` };
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return { valid: false, error: `${param.name} must be a boolean` };
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          return { valid: false, error: `${param.name} must be an array` };
        }
        break;
      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          return { valid: false, error: `${param.name} must be an object` };
        }
        break;
    }

    return { valid: true };
  }
}