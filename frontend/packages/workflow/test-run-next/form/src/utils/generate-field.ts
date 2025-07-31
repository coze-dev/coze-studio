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

import { type IFormSchema } from '../form-engine';
import { generateFieldValidator } from './generate-field-validator';
import { generateFieldComponent } from './generate-field-component';

interface GenerateFieldOptions {
  type: ViewVariableType;
  name: string;
  title?: string;
  required?: boolean;
  description?: string;
  defaultValue?: string;
  validateJsonSchema?: any;
  extra?: IFormSchema;
}

/**
 * Form Field Schema Calculation
 */
export const generateField = (options: GenerateFieldOptions): IFormSchema => {
  const {
    type,
    name,
    title,
    required = true,
    description,
    defaultValue,
    validateJsonSchema,
    extra,
  } = options;

  return {
    name,
    title,
    description,
    required,
    ['x-decorator']: 'FieldItem',
    ['x-decorator-props']: {
      tag: ViewVariableType.LabelMap[type],
    },
    ['x-origin-type']: type as unknown as string,
    ...generateFieldValidator(options),
    // rendering component related
    ...generateFieldComponent({ type, validateJsonSchema }),
    // Component also comes with default values, and the default values of imported parameters have higher priority
    defaultValue,
    ...extra,
  };
};
