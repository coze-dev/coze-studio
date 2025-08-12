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

import type { Validate } from '@flowgram-adapter/free-layout-editor';

export type FormSchemaTypes =
  | 'string'
  | 'object'
  | 'array'
  | 'number'
  | 'boolean'
  | 'void'
  | string;

export type IFormSchemaValidate = Validate;

export interface FormSchemaUIState {
  disabled: boolean;
}

export interface IFormSchema<FrameworkComponent = React.ReactNode> {
  /*******************************************************
   * core attributes
   */
  version?: string;
  name?: string;
  type?: FormSchemaTypes;
  /** Default value, "default" is the jsonSchema standard field, but it is the js keyword, so defaultValue is used */
  defaultValue?: any;

  /*******************************************************
   * drill down properties
   */
  properties?: Record<string, IFormSchema<FrameworkComponent>>;
  items?: IFormSchema<FrameworkComponent>[];

  /*******************************************************
   * UI attribute
   */
  title?: FrameworkComponent | string;
  description?: FrameworkComponent | string;
  /** order */
  ['x-index']?: number;
  ['x-visible']?: boolean;
  ['x-hidden']?: boolean;
  ['x-disabled']?: boolean;
  /** Rendered components */
  ['x-component']?: string;
  ['x-component-props']?: Record<string, unknown>;
  /** decorator */
  ['x-decorator']?: string;
  ['x-decorator-props']?: Record<string, unknown>;

  /*******************************************************
   * Legitimacy Attribute
   */
  required?: boolean;
  ['x-validator']?: IFormSchemaValidate;

  /*******************************************************
   * Less commonly used or more expensive to implement
   */
  ['x-reactions']?: any;
  ['x-content']?: FrameworkComponent;
  /** wild-card field */
  patternProperties?: Record<string, IFormSchema<FrameworkComponent>>;
  /** Fields outside the definition */
  additionalProperties?: IFormSchema<FrameworkComponent>;
  /** Items outside the definition */
  additionalItems?: IFormSchema<FrameworkComponent>;

  /*******************************************************
   * business custom field
   */
  /** Node ID */
  ['x-node-id']?: string;
  /** Node type */
  ['x-node-type']?: string;
  /** form mode */
  ['x-form-mode']?: 'form' | 'json';
  /** Field corresponding variable primitive type */
  ['x-origin-type']?: string;
  [key: string]: any;
}
