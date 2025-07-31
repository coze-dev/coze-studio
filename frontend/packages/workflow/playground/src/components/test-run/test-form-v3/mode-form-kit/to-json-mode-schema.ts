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

import { type SchemaObject } from 'ajv';
import {
  TestFormFieldName,
  generateFieldValidator,
  type IFormSchema,
} from '@coze-workflow/test-run-next';
import { ViewVariableType } from '@coze-workflow/base';

import { visitNodeLeaf } from './visit-node-leaf';
import { getJsonModeFieldDefaultValue } from './get-json-mode-field-default-value';

const getDefaultValue = (properties: IFormSchema['properties']) => {
  const values = {};
  visitNodeLeaf(properties, (groupKey, key, field) => {
    values[groupKey] = {
      ...values[groupKey],
      [key]: getJsonModeFieldDefaultValue(
        field['x-origin-type'] as any,
        field.defaultValue,
      ),
    };
  });
  return JSON.stringify(values, undefined, 2);
};

const generateValidateJsonSchemaField = (field: IFormSchema) => {
  const originType = field['x-origin-type'] as any;
  if (originType === ViewVariableType.Integer) {
    return {
      type: 'integer',
    };
  }
  if (originType === ViewVariableType.Number) {
    return {
      type: 'number',
    };
  }
  if (originType === ViewVariableType.Boolean) {
    return {
      type: 'boolean',
    };
  }
  if (
    ViewVariableType.isArrayType(originType) &&
    ViewVariableType.isFileType(originType)
  ) {
    return {
      type: 'array',
      items: { type: 'string' },
    };
  }
  // A complex type uses its own jsonSchema.
  if (
    ViewVariableType.isArrayType(originType) ||
    originType === ViewVariableType.Object
  ) {
    return field['x-component-props']?.jsonSchema;
  }

  return {
    type: 'string',
  };
};

const getValidateJsonSchema = (properties: IFormSchema['properties']) => {
  const temp: SchemaObject = {
    type: 'object',
    properties: {},
    required: [],
  };
  visitNodeLeaf(properties, (groupKey, key, field) => {
    const groupTemp = temp.properties[groupKey] || {
      type: 'object',
      properties: {},
      required: [],
    };
    groupTemp.properties[key] = generateValidateJsonSchemaField(field);
    if (field.required) {
      groupTemp.required.push(key);
      if (!temp.required.includes(groupKey)) {
        temp.required.push(groupKey);
      }
    }
    temp.properties[groupKey] = groupTemp;
  });
  return temp;
};

export const toJsonModeSchema = (origin: IFormSchema) => {
  const nodeField = origin.properties?.[TestFormFieldName.Node];
  const nodeProperties = nodeField?.properties;
  /**
   * If the node does not have any imported parameters, it is not processed
   */
  if (!nodeProperties) {
    return;
  }
  const validateJsonSchema = getValidateJsonSchema(nodeProperties);

  nodeField.properties = {
    [TestFormFieldName.JSON]: {
      ['x-component']: 'JsonModeInput',
      ['x-component-props']: {
        properties: nodeProperties,
        validateJsonSchema,
      },
      defaultValue: getDefaultValue(nodeProperties),
      ...generateFieldValidator({
        name: TestFormFieldName.JSON,
        validateJsonSchema,
      }),
    },
  };
};
