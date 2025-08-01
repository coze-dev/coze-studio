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

import { type FC } from 'react';

import { customAlphabet } from 'nanoid';
import { VARIABLE_TYPE_ALIAS_MAP, ViewVariableType } from '@coze-workflow/base';
import { json } from '@coze-editor/editor/language-json';

import {
  type InputComponentRegistry,
  type InputType,
  type LiteralValueInputProps,
} from './type';
import { InputString } from './input-string';

const nanoid = customAlphabet('0123456789abcdefABCDEF', 8);

const uriMap: Record<
  | ViewVariableType.ArrayString
  | ViewVariableType.ArrayNumber
  | ViewVariableType.ArrayInteger
  | ViewVariableType.ArrayBoolean
  | ViewVariableType.ArrayObject,
  string
> = {
  [ViewVariableType.ArrayString]: `${
    VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.ArrayString]
  }_${nanoid()}`,
  [ViewVariableType.ArrayNumber]: `${
    VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.ArrayNumber]
  }_${nanoid()}`,
  [ViewVariableType.ArrayInteger]: `${
    VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.ArrayInteger]
  }_${nanoid()}`,
  [ViewVariableType.ArrayBoolean]: `${
    VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.ArrayBoolean]
  }_${nanoid()}`,
  [ViewVariableType.ArrayObject]: `${
    VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.ArrayObject]
  }_${nanoid()}`,
};

/**
 * Generate a random JSON file URI
 * @param schemaUri jsonSchema unique identifier
 * @returns
 */
export const generateJsonFileUri = (schemaUri: string) =>
  `${schemaUri}_${nanoid()}.json`;

export const getJsonSchemaUriByInputType = (inputType: ViewVariableType) =>
  uriMap[inputType] || `${VARIABLE_TYPE_ALIAS_MAP[inputType]}_${nanoid()}`;

export const configureJsonSchemas = () => {
  const schemas = [
    {
      uri: uriMap[ViewVariableType.ArrayString],
      fileMatch: [`${uriMap[ViewVariableType.ArrayString]}_*.json`],
      schema: { type: 'array', items: { type: 'string' } },
    },
    {
      uri: uriMap[ViewVariableType.ArrayNumber],
      fileMatch: [`${uriMap[ViewVariableType.ArrayNumber]}_*.json`],
      schema: { type: 'array', items: { type: 'number' } },
    },
    {
      uri: uriMap[ViewVariableType.ArrayInteger],
      fileMatch: [`${uriMap[ViewVariableType.ArrayInteger]}_*.json`],
      schema: { type: 'array', items: { type: 'integer' } },
    },
    {
      uri: uriMap[ViewVariableType.ArrayBoolean],
      fileMatch: [`${uriMap[ViewVariableType.ArrayBoolean]}_*.json`],
      schema: { type: 'array', items: { type: 'boolean' } },
    },
    {
      uri: uriMap[ViewVariableType.ArrayObject],
      fileMatch: [`${uriMap[ViewVariableType.ArrayObject]}_*.json`],
      schema: { type: 'array', items: { type: 'object' } },
    },
  ];

  json.languageService.configureSchemas(schemas);
};

export const getInputComponent = (
  inputType: InputType,
  optionsList: { label: string; value: string }[] | undefined,
  componentRegistry: InputComponentRegistry[],
): FC<LiteralValueInputProps> => {
  const registry = componentRegistry.filter(item => {
    if (typeof item.canHandle === 'function') {
      return item.canHandle(inputType, optionsList);
    }
    return item.canHandle === inputType;
  });
  const { length } = registry;
  if (registry.length === 0) {
    console.error(`${inputType} has no input component!`);
    return InputString;
  }
  return registry[length - 1]?.component;
};
